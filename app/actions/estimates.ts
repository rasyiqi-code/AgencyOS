"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { processAffiliateCommissionsBulk } from "@/lib/affiliate/commission";
import { notifyPaymentSuccess } from "@/lib/email/admin-notifications";
import { sendPaymentSuccessEmail } from "@/lib/email/client-notifications";
import { sendOrderCancelledEmail } from "@/lib/email/client-notifications";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ScreenItemSchema, ApiItemSchema, type ScreenItem, type ApiItem } from "@/lib/shared/types";

export async function confirmPayment(id: string) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    const targetId = id;
    const isOrderId = targetId.startsWith('ORDER-');

    try {
        let estimateId = isOrderId ? null : targetId;
        let orderFromId = null;

        if (isOrderId) {
            orderFromId = await prisma.order.findUnique({
                where: { id: targetId },
                include: {
                    project: { include: { estimate: true } }
                }
            });
            estimateId = orderFromId?.project?.estimate?.id || null;
        }

        const estimate = estimateId ? await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
                project: { include: { orders: true } }
            }
        }) : null;

        const project = estimate?.project || orderFromId?.project;

        if (!project && !estimate) {
            return { error: "Transaction/Invoice not found" };
        }

        const pendingOrders = isOrderId && orderFromId
            ? [orderFromId]
            : ((project as Record<string, unknown>)?.orders as { id: string; status: string; type: string; amount: number; currency: string; exchangeRate: number | null; paymentMetadata: unknown }[] || []).filter((o) =>
                o.status === 'pending' || o.status === 'waiting_verification'
            );

        let paymentType = isOrderId && orderFromId ? (orderFromId.type || 'FULL') : 'FULL';
        let amountPaid = isOrderId && orderFromId ? orderFromId.amount : (project?.totalAmount || 0);

        if (!isOrderId && pendingOrders.length > 0) {
            const targetOrder = pendingOrders[0];
            paymentType = targetOrder.type;
            const orderRate = targetOrder.exchangeRate || 1;
            amountPaid = targetOrder.currency === 'IDR' && targetOrder.amount > 5000
                ? targetOrder.amount / orderRate
                : targetOrder.amount;
        }

        const totalAmount = project?.totalAmount || estimate?.totalCost || 0;

        let newProjectPaymentStatus = 'PAID';
        const newProjectStatus = 'queue';

        if (paymentType === 'DP') {
            newProjectPaymentStatus = 'PARTIAL';
        }

        if (paymentType !== 'DP' && estimateId) {
            await prisma.estimate.update({
                where: { id: estimateId },
                data: { status: 'paid' }
            });
        }

        if (project) {
            const currentPaid = project.paidAmount || 0;
            const finalPaidAmount = paymentType === 'DP' ? currentPaid + amountPaid : totalAmount;

            await prisma.project.update({
                where: { id: project.id },
                data: {
                    status: newProjectStatus,
                    paymentStatus: newProjectPaymentStatus,
                    paidAmount: finalPaidAmount
                }
            });

            if (pendingOrders.length > 0) {
                await prisma.order.updateMany({
                    where: { id: { in: pendingOrders.map((o) => o.id) } },
                    data: { status: 'paid' }
                });

                await processAffiliateCommissionsBulk(pendingOrders);
            }

            try {
                let customerEmail = "";
                let customerName = "Client";

                if (project.userId !== 'OFFLINE') {
                    const stackUser = await hexclaveServerApp.getUser(project.userId);
                    if (stackUser) {
                        customerEmail = stackUser.primaryEmail || "";
                        customerName = stackUser.displayName || customerEmail.split('@')[0] || "Client";
                    }
                } else if (project.clientName) {
                    customerName = project.clientName;
                }

                if (customerEmail) {
                    sendPaymentSuccessEmail({
                        to: customerEmail,
                        customerName,
                        orderId: targetId,
                        amount: amountPaid,
                        productName: project.title || (estimate?.title) || "Service"
                    }).catch(err => console.error("Client notification error:", err));
                }

                notifyPaymentSuccess({
                    orderId: targetId,
                    amount: amountPaid,
                    customerName,
                    type: "SERVICE"
                }).catch(err => console.error("Admin notification error:", err));
            } catch (err) {
                console.error("Failed to fetch user for notifications:", err);
            }
        }

        revalidatePath("/admin/finance");
        return { success: true };
    } catch (error) {
        console.error("Confirm Order Error:", error);
        return { error: "Internal Server Error" };
    }
}

export async function cancelEstimate(id: string) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    const targetId = id;
    const isOrderId = targetId.startsWith('ORDER-');

    try {
        let estimateId = isOrderId ? null : targetId;
        let orderFromId = null;

        if (isOrderId) {
            orderFromId = await prisma.order.findUnique({
                where: { id: targetId },
                include: {
                    project: { include: { estimate: true, orders: true } }
                }
            });
            estimateId = orderFromId?.project?.estimate?.id || null;
        }

        const estimate = estimateId ? await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
                project: { include: { orders: true } }
            }
        }) : null;

        const project = estimate?.project || orderFromId?.project;

        if (!project && !estimate && !orderFromId) {
            return { error: "Transaction/Invoice not found" };
        }

        const updates: Prisma.PrismaPromise<unknown>[] = [];

        if (orderFromId) {
            updates.push(
                prisma.order.update({
                    where: { id: orderFromId.id },
                    data: { status: 'cancelled' }
                })
            );
        }

        if (estimateId) {
            updates.push(
                prisma.estimate.update({
                    where: { id: estimateId },
                    data: { status: 'cancelled' }
                })
            );
        }

        if (project) {
            updates.push(
                prisma.project.update({
                    where: { id: project.id },
                    data: { status: 'cancelled', paymentStatus: 'UNPAID' }
                })
            );

            const projectOrders = (project as Record<string, unknown>).orders as { id: string; status: string }[] || [];
            const pendingOrderIds = projectOrders
                .filter(o => o.status === 'pending' || o.status === 'waiting_verification')
                .map(o => o.id);

            if (pendingOrderIds.length > 0) {
                updates.push(
                    prisma.order.updateMany({
                        where: { id: { in: pendingOrderIds } },
                        data: { status: 'cancelled' }
                    })
                );
            }
        }

        await prisma.$transaction(updates);

        if (project) {
            try {
                let customerEmail = "";
                let customerName = "Client";

                if (project.userId !== 'OFFLINE') {
                    const stackUser = await hexclaveServerApp.getUser(project.userId);
                    if (stackUser) {
                        customerEmail = stackUser.primaryEmail || "";
                        customerName = stackUser.displayName || customerEmail.split('@')[0] || "Client";
                    }
                } else if (project.clientName) {
                    customerName = project.clientName;
                }

                if (customerEmail) {
                    sendOrderCancelledEmail({
                        to: customerEmail,
                        customerName,
                        orderId: targetId,
                        productName: project.title || estimate?.title || "Service"
                    }).catch(err => console.error("Cancellation notification error:", err));
                }
            } catch (err) {
                console.error("Failed to fetch user for cancellation notification:", err);
            }
        }

        revalidatePath("/admin/finance");
        return { success: true };
    } catch (error) {
        console.error("Cancel Order Error:", error);
        return { error: "Internal Server Error" };
    }
}

const UpdateBodySchema = z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    additions: z.object({
        screens: z.array(ScreenItemSchema).optional(),
        apis: z.array(ApiItemSchema).optional(),
    }).optional(),
    removals: z.object({
        screens: z.array(z.string()).optional(),
        apis: z.array(z.string()).optional(),
    }).optional(),
    screens: z.array(ScreenItemSchema).optional(),
    apis: z.array(ApiItemSchema).optional(),
});

export async function updateEstimate(estimateId: string, body: unknown) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    try {
        const validation = UpdateBodySchema.safeParse(body);
        if (!validation.success) {
            return { error: "Invalid input", details: validation.error.format() };
        }

        const data = validation.data;
        const { additions, removals, summary, title } = data;

        const currentEstimate = await prisma.estimate.findUnique({
            where: { id: estimateId }
        });

        if (!currentEstimate) return { error: "Estimate not found" };

        let existingScreens = (currentEstimate.screens as unknown as ScreenItem[]) || [];
        let existingApis = (currentEstimate.apis as unknown as ApiItem[]) || [];

        if (removals) {
            if (removals.screens?.length) {
                existingScreens = existingScreens.filter(s => !removals.screens?.includes(s.title));
            }
            if (removals.apis?.length) {
                existingApis = existingApis.filter(a => !removals.apis?.includes(a.title));
            }
        }

        const newScreens = additions?.screens || data.screens || [];
        const newApis = additions?.apis || data.apis || [];

        const mergedScreens = [...existingScreens, ...newScreens];
        const mergedApis = [...existingApis, ...newApis];

        const HOURLY_RATE = 12;

        const screensHours = mergedScreens.reduce((acc, item) => acc + (item.hours || 0), 0);
        const apisHours = mergedApis.reduce((acc, item) => acc + (item.hours || 0), 0);
        const totalHours = screensHours + apisHours;
        const totalCost = totalHours * HOURLY_RATE;

        const updatedEstimate = await prisma.estimate.update({
            where: { id: estimateId },
            data: {
                title: title || undefined,
                summary: summary || undefined,
                screens: mergedScreens as unknown as Prisma.InputJsonValue,
                apis: mergedApis as unknown as Prisma.InputJsonValue,
                totalHours,
                totalCost,
            },
        });

        revalidatePath("/admin/finance/quotes");
        return { success: true, data: updatedEstimate };
    } catch (error) {
        console.error("Error updating estimate:", error);
        return { error: "Failed to update estimate" };
    }
}
