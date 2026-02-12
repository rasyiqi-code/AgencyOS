import { prisma } from "@/lib/config/db";
import { getCore } from "@/lib/integrations/midtrans";
import { creem as getCreem } from "@/lib/integrations/creem";
import { NextResponse } from "next/server";
import type { CreemPaymentMetadata } from "@/types/payment";
import { processAffiliateCommission } from "@/lib/affiliate/commission";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return new NextResponse("Missing orderId", { status: 400 });
    }

    try {
        console.log(`[PAYMENT_STATUS] Checking Order ${orderId}`);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                status: true,
                transactionId: true,
                projectId: true
            }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // Smart Check: If pending and has transactionId, check upstream
        if (order.status === 'pending' && order.transactionId) {
            try {
                const core = await getCore();
                const midtransStatus = await core.transaction.status(order.transactionId);
                const transactionStatus = midtransStatus.transaction_status;

                let dbStatus = "pending";
                if (transactionStatus === "capture" || transactionStatus === "settlement") {
                    dbStatus = "settled";
                } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
                    dbStatus = transactionStatus;
                }

                if (dbStatus !== "pending") {
                    // Update Order
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: dbStatus,
                            paymentType: midtransStatus.payment_type
                        }
                    });

                    // Update Project/Estimate if settled
                    if (dbStatus === "settled") {
                        const updatedOrder = await prisma.order.findUnique({
                            where: { id: orderId },
                            include: { project: true }
                        });

                        if (updatedOrder?.project) {
                            await prisma.project.update({
                                where: { id: updatedOrder.project.id },
                                data: { status: "queue" }
                            });

                            if (updatedOrder.project.estimateId) {
                                await prisma.estimate.update({
                                    where: { id: updatedOrder.project.estimateId },
                                    data: { status: "paid" }
                                });
                            }
                        }

                        // Proses komisi affiliate (jika ada referral)
                        const fullOrder = await prisma.order.findUnique({ where: { id: orderId } });
                        if (fullOrder) {
                            await processAffiliateCommission(orderId, fullOrder.amount, fullOrder.paymentMetadata);
                        }
                    }

                    // Return updated status
                    return NextResponse.json({ status: dbStatus });
                }
            } catch (midtransError) {
                console.error("Midtrans check failed:", midtransError);
                // Fallback to existing DB status if upstream check fails
            }
        }

        // 2. Creem Check
        if (order.status === 'pending') {
            const checkoutId = searchParams.get('checkout_id') || order.transactionId;
            console.log(`[PAYMENT_STATUS] Checking Creem for Order ${orderId}, Checkout: ${checkoutId}`);

            if (checkoutId) {
                try {
                    const creem = await getCreem();
                    const creemStatus = await creem.checkouts.get({ checkoutId });

                    console.log("[PAYMENT_STATUS] Creem Status:", JSON.stringify(creemStatus, null, 2));

                    const status = creemStatus.status as string;
                    if (status === 'completed' || status === 'paid') {
                        // Simpan paymentMetadata sebelum di-overwrite oleh creemStatus
                        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
                        const affiliateMetadata = existingOrder?.paymentMetadata;

                        // Update Order
                        const updatedOrder = await prisma.order.update({
                            where: { id: orderId },
                            data: {
                                status: "paid",
                                transactionId: checkoutId,
                                paymentMetadata: creemStatus as unknown as CreemPaymentMetadata
                            },
                            include: { project: true }
                        });

                        // Activate Project/Estimate
                        if (updatedOrder.project) {
                            await prisma.project.update({
                                where: { id: updatedOrder.project.id },
                                data: { status: "queue" }
                            });

                            if (updatedOrder.project.estimateId) {
                                await prisma.estimate.update({
                                    where: { id: updatedOrder.project.estimateId },
                                    data: { status: "paid" }
                                });
                            }
                        }

                        // Proses komisi affiliate (gunakan metadata asli sebelum overwrite)
                        await processAffiliateCommission(orderId, updatedOrder.amount, affiliateMetadata);

                        order.status = "paid"; // Update local var for redirect logic
                    }
                } catch (e) {
                    console.error("Creem manual check failed:", e);
                }
            }
        }

        // Redirect logic for user or JSON for polling
        const mode = searchParams.get('mode');

        if (mode === 'json') {
            return NextResponse.json({
                status: order.status,
                transactionId: order.transactionId
            });
        }

        if (order.status === 'paid' || order.status === 'settled') {
            return NextResponse.redirect(new URL(`/invoices/${orderId}?status=success`, req.url));
        } else {
            // If still pending, redirect but maybe with pending status?
            // Or verify if we should just redirect to invoice page anyway.
            return NextResponse.redirect(new URL(`/invoices/${orderId}?status=pending`, req.url));
        }

    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
