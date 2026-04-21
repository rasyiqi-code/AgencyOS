import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { Prisma } from "@prisma/client";
import { stackServerApp } from "@/lib/config/stack";
import { sendOrderCancelledEmail } from "@/lib/email/client-notifications";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    // Auth check: Admin only
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetId = params.id;
    const isOrderId = targetId.startsWith('ORDER-');

    try {
        let estimateId = isOrderId ? null : targetId;
        let orderFromId = null;

        // 1. Resolve the actual estimate and project
        if (isOrderId) {
            orderFromId = await prisma.order.findUnique({
                where: { id: targetId },
                include: {
                    project: {
                        include: {
                            estimate: true,
                            orders: true
                        }
                    }
                }
            });
            estimateId = orderFromId?.project?.estimate?.id || null;
        }

        const estimate = estimateId ? await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
                project: {
                    include: { orders: true }
                }
            }
        }) : null;

        const project = estimate?.project || orderFromId?.project;

        if (!project && !estimate && !orderFromId) {
            return NextResponse.json({ error: "Transaction/Invoice not found" }, { status: 404 });
        }

        const updates: Prisma.PrismaPromise<unknown>[] = [];

        // 0. Update Order Status (if we have order object)
        if (orderFromId) {
            updates.push(
                prisma.order.update({
                    where: { id: orderFromId.id },
                    data: { status: 'cancelled' }
                })
            );
        }

        // 1. Update Estimate Status
        if (estimateId) {
            updates.push(
                prisma.estimate.update({
                    where: { id: estimateId },
                    data: { status: 'cancelled' }
                })
            );
        }

        // 2. Update Project Status (if exists)
        if (project) {
            updates.push(
                prisma.project.update({
                    where: { id: project.id },
                    data: {
                        status: 'cancelled',
                        paymentStatus: 'UNPAID' // Reset payment status if cancelled
                    }
                })
            );

            // 3. Cancel associated pending/waiting orders
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

        // --- Notifications ---
        if (project) {
            try {
                let customerEmail = "";
                let customerName = "Client";

                if (project.userId !== 'OFFLINE') {
                    const stackUser = await stackServerApp.getUser(project.userId);
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
