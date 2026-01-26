import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creem } from "@/lib/creem";

// Helper to update order/subscription status
const updateOrderStatus = async (orderId: string, status: string, metadata: Record<string, unknown>) => {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paymentMetadata: metadata as any
            }
        });
        console.log(`[CREEM_WEBHOOK] Order ${orderId} updated to ${status}`);
    } catch (error) {
        console.error(`[CREEM_WEBHOOK] Failed to update order ${orderId}:`, error);
    }
};

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get("creem-signature");

        if (!signature) {
            console.error("[CREEM_WEBHOOK] Missing signature header");
            return NextResponse.json({ message: "Missing signature" }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleSubscriptionEvent = async (data: any, status: string, label: string) => {
            const orderId = data.metadata?.orderId;
            if (orderId) {
                await updateOrderStatus(orderId, status, data);
            } else {
                console.log(`[CREEM_WEBHOOK] ${label} received but no Order ID found.`);
            }
        };

        await creem.webhooks.handleEvents(payload, signature, {
            onCheckoutCompleted: async (data) => {
                const orderId = data.metadata?.orderId as string | undefined;
                if (orderId) {
                    await updateOrderStatus(orderId, "paid", data as unknown as Record<string, unknown>);
                }
            },
            onSubscriptionActive: async (data) => {
                await handleSubscriptionEvent(data, "paid", "Subscription Active");
            },
            onSubscriptionPaid: async (data) => {
                await handleSubscriptionEvent(data, "paid", "Subscription Paid");
            },
            onSubscriptionCanceled: async (data) => {
                await handleSubscriptionEvent(data, "canceled", "Subscription Canceled");
            },
            onSubscriptionExpired: async (data) => {
                await handleSubscriptionEvent(data, "expired", "Subscription Expired");
            },
            onSubscriptionUnpaid: async (data) => {
                const orderId = data.metadata?.orderId;
                console.warn(`[CREEM_WEBHOOK] Subscription Unpaid for Order ${orderId}`);
            },
            onSubscriptionPastDue: async (data) => {
                const orderId = data.metadata?.orderId;
                console.warn(`[CREEM_WEBHOOK] Subscription Past Due for Order ${orderId}`);
            },
            onRefundCreated: async (data) => {
                await handleSubscriptionEvent(data, "refunded", "Refund Created");
            },
            onDisputeCreated: async (data) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const orderId = (data as any).metadata?.orderId;
                console.error(`[CREEM_WEBHOOK] DISPUTE CREATED for Order ${orderId}! Action required.`);
            },
        });

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("[CREEM_WEBHOOK_ERROR]", error.message);
        return NextResponse.json({ message: "Webhook handler failed: " + error.message }, { status: 400 });
    }
}
