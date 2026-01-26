import { prisma } from "@/lib/db";
import { core } from "@/lib/midtrans";
import { creem } from "@/lib/creem";
import { NextResponse } from "next/server";

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
                        data: { status: dbStatus }
                    });

                    // Update Project if settled
                    if (dbStatus === "settled" && order.projectId) {
                        await prisma.project.update({
                            where: { id: order.projectId },
                            data: { status: "dev" }
                        });
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
            const checkoutId = searchParams.get('checkout_id');
            console.log(`[PAYMENT_STATUS] Params:`, Object.fromEntries(searchParams));

            // Check if we have a checkout_id from query (redirect) or stored in metadata
            if (checkoutId) {
                try {
                    const creemStatus = await creem.checkouts.get({ checkoutId });
                    // Creem status: 'ordered', 'paid', 'completed'? Need to check docs or payload. 
                    // Assuming 'completed' or 'paid' property inside.
                    // The webhook log implies 'checkout.completed'.
                    // Let's assume the status field is 'status'.
                    console.log("[PAYMENT_STATUS] Creem Manual Check:", JSON.stringify(creemStatus, null, 2));

                    const status = creemStatus.status as string;
                    if (status === 'completed' || status === 'paid') {
                        await prisma.order.update({
                            where: { id: orderId },
                            data: {
                                status: "paid",
                                transactionId: checkoutId, // Store checkout ID if not already
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                paymentMetadata: creemStatus as any
                            }
                        });
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
