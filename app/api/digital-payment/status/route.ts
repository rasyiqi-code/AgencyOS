import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/config/stack";
import { getCore } from "@/lib/integrations/midtrans";
import { completeDigitalOrder } from "@/app/actions/digital-orders";
import type { MidtransPaymentMetadata } from "@/types/payment";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        // Auth check: hanya user login yang boleh cek status pembayaran
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // Cek ownership: hanya pemilik order yang boleh cek status (cegah IDOR)
        const order = await prisma.digitalOrder.findFirst({
            where: {
                id: orderId,
                userId: user.id,
            },
            select: {
                status: true,
                paymentId: true,
                paymentType: true // Added to identify payment provider
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        let currentStatus = order.status;

        // Smart Check: If not PAID, check upstream with provider
        if (currentStatus !== 'PAID' && currentStatus !== 'settled' && order.paymentId) {
            try {
                // 1. Creem Smart Check
                if (order.paymentType === 'creem') {
                    const { creem: getCreem } = await import("@/lib/integrations/creem");
                    const creem = await getCreem();
                    const creemStatus = await creem.checkouts.get({ checkoutId: order.paymentId });

                    if (creemStatus.status === 'completed' || creemStatus.status === 'paid') {
                        const result = await completeDigitalOrder(orderId, order.paymentId, "creem");
                        if (result.success) {
                            currentStatus = 'PAID';
                        }
                    } else if (['canceled', 'expired'].includes(creemStatus.status)) {
                        currentStatus = creemStatus.status.toUpperCase();
                        await prisma.digitalOrder.update({
                            where: { id: orderId },
                            data: { status: currentStatus }
                        });
                    }
                }
                // 2. Midtrans Smart Check
                else {
                    const core = await getCore();
                    const midtransStatus = await core.transaction.status(order.paymentId);
                    const transactionStatus = midtransStatus.transaction_status;

                    if (transactionStatus === "capture" || transactionStatus === "settlement") {
                        // Update database and complete order
                        const transId = (midtransStatus as MidtransPaymentMetadata).transaction_id || order.paymentId;
                        const result = await completeDigitalOrder(orderId, transId, midtransStatus.payment_type);
                        if (result.success) {
                            currentStatus = 'PAID';
                        }
                    } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
                        currentStatus = transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED';
                        await prisma.digitalOrder.update({
                            where: { id: orderId },
                            data: { status: currentStatus }
                        });
                    }
                }
            } catch (providerError) {
                console.error("[DIGITAL_STATUS_CHECK] Upstream check failed:", providerError);
            }
        }

        // Return for polling (JSON) or redirect for browser (Creem success)
        const mode = searchParams.get("mode");
        if (mode === "json") {
            return NextResponse.json({ status: currentStatus });
        }

        // Browser redirect (usually after Creem checkout)
        if (currentStatus === 'PAID') {
            return NextResponse.redirect(new URL(`/digital-invoices/${orderId}?status=success`, request.url));
        } else {
            return NextResponse.redirect(new URL(`/digital-invoices/${orderId}?status=pending`, request.url));
        }
    } catch (error) {
        console.error("Error fetching order status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
