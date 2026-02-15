import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { creem } from "@/lib/integrations/creem";
import { Prisma } from "@prisma/client";
import { processAffiliateCommission } from "@/lib/affiliate/commission";

// Helper to update order/subscription status
const updateOrderStatus = async (orderId: string, status: string, metadata: unknown) => {
    try {
        const isDigital = orderId.startsWith("DIGI-");

        if (isDigital) {
            console.log(`[CREEM_WEBHOOK] Updating Digital Order ${orderId} to ${status}`);

            // Activate Digital Order if paid
            if (status === 'paid') {
                const { completeDigitalOrder } = await import("@/app/actions/digital-orders");
                // Midtrans digital route uses paymentId for SDK transaction_id
                // Checkout completed data usually has checkout id which we stored as transactionId/paymentId
                const creemData = metadata as { id?: string };
                const transactionId = creemData.id || orderId;

                await completeDigitalOrder(orderId, transactionId, "credit_card");
            } else {
                await prisma.digitalOrder.update({
                    where: { id: orderId },
                    data: {
                        status: status.toUpperCase(),
                        paymentMetadata: metadata as Prisma.InputJsonValue
                    }
                });
            }
            return;
        }

        // Simpan paymentMetadata asli sebelum di-overwrite (untuk affiliate code)
        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
        const affiliateMetadata = existingOrder?.paymentMetadata;

        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                paymentMetadata: metadata as Prisma.InputJsonValue
            },
            include: {
                project: {
                    include: { estimate: true }
                }
            }
        });
        console.log(`[CREEM_WEBHOOK] Order ${orderId} updated to ${status}`);

        // If paid, activate Project and Estimate + update paymentStatus & paidAmount
        if (status === 'paid' && order.project) {
            // Hitung paidAmount dan status pembayaran
            const currentPaid = order.project.paidAmount || 0;
            const newPaid = currentPaid + order.amount;

            let paymentStatus = "UNPAID";
            if (order.type === "FULL" || order.type === "REPAYMENT") {
                paymentStatus = "PAID";
            } else if (order.type === "DP") {
                paymentStatus = "PARTIAL";
            }

            await prisma.project.update({
                where: { id: order.project.id },
                data: {
                    status: 'queue',
                    paymentStatus: paymentStatus,
                    paidAmount: newPaid,
                }
            });

            // If Project was created from an Estimate, mark Estimate as Paid too
            if (order.project.estimateId) {
                await prisma.estimate.update({
                    where: { id: order.project.estimateId },
                    data: { status: 'paid' }
                });
            }

            // Proses komisi affiliate (gunakan metadata asli sebelum overwrite)
            await processAffiliateCommission(orderId, order.amount, affiliateMetadata);
        }
    } catch (error) {
        console.error(`[CREEM_WEBHOOK] Failed to update order ${orderId}:`, error);
    }
};

interface CreemPayload {
    metadata?: {
        orderId?: string | null;
    } | null;
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get("creem-signature");

        if (!signature) {
            console.error("[CREEM_WEBHOOK] Missing signature header");
            return NextResponse.json({ message: "Missing signature" }, { status: 401 });
        }

        const handleSubscriptionEvent = async (data: CreemPayload | null, status: string, label: string) => {
            const orderId = data?.metadata?.orderId;
            if (orderId) {
                await updateOrderStatus(orderId, status, data);
            } else {
                console.log(`[CREEM_WEBHOOK] ${label} received but no Order ID found.`);
            }
        };

        const sdk = await creem();
        await sdk.webhooks.handleEvents(payload, signature, {
            onCheckoutCompleted: async (data: unknown) => {
                const creemData = data as CreemPayload;
                const orderId = creemData.metadata?.orderId;
                if (orderId) {
                    await updateOrderStatus(orderId, "paid", data as Prisma.InputJsonValue);
                }
            },
            onSubscriptionActive: async (data: unknown) => {
                await handleSubscriptionEvent(data as CreemPayload, "paid", "Subscription Active");
            },
            onSubscriptionPaid: async (data: unknown) => {
                await handleSubscriptionEvent(data as CreemPayload, "paid", "Subscription Paid");
            },
            onSubscriptionCanceled: async (data: unknown) => {
                await handleSubscriptionEvent(data as CreemPayload, "canceled", "Subscription Canceled");
            },
            onSubscriptionExpired: async (data: unknown) => {
                await handleSubscriptionEvent(data as CreemPayload, "expired", "Subscription Expired");
            },
            onSubscriptionUnpaid: async (data: unknown) => {
                const creemData = data as CreemPayload;
                const orderId = creemData.metadata?.orderId;
                console.warn(`[CREEM_WEBHOOK] Subscription Unpaid for Order ${orderId}`);
            },
            onSubscriptionPastDue: async (data: unknown) => {
                const creemData = data as CreemPayload;
                const orderId = creemData.metadata?.orderId;
                console.warn(`[CREEM_WEBHOOK] Subscription Past Due for Order ${orderId}`);
            },
            onRefundCreated: async (data: unknown) => {
                await handleSubscriptionEvent(data as CreemPayload, "refunded", "Refund Created");
            },
            onDisputeCreated: async (data: unknown) => {
                const creemData = data as CreemPayload;
                const orderId = creemData.metadata?.orderId;
                console.error(`[CREEM_WEBHOOK] DISPUTE CREATED for Order ${orderId}! Action required.`);
            },
        });

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[CREEM_WEBHOOK_ERROR]", message);
        return NextResponse.json({ message: "Webhook handler failed: " + message }, { status: 400 });
    }
}
