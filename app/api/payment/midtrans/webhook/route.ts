import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { processAffiliateCommission } from "@/lib/affiliate/commission";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            payment_type,
            transaction_id,
        } = body;

        const midtransConfig = await paymentGatewayService.getMidtransConfig();

        // Verify signature
        const serverKey = midtransConfig.serverKey;
        if (!serverKey) {
            console.error("[MIDTRANS_WEBHOOK] Server key not configured");
            return new NextResponse("Configuration error", { status: 500 });
        }

        const hashed = crypto
            .createHash("sha512")
            .update(order_id + status_code + gross_amount + serverKey)
            .digest("hex");

        if (hashed !== signature_key) {
            return new NextResponse("Invalid signature", { status: 403 });
        }

        console.log(`[MIDTRANS_WEBHOOK] Order: ${order_id}, Status: ${transaction_status}`);

        // Map Midtrans status to our database status
        let dbStatus = "pending";
        if (transaction_status === "capture" || transaction_status === "settlement") {
            dbStatus = "settled";
        } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
            dbStatus = transaction_status;
        } else if (transaction_status === "pending") {
            dbStatus = "pending";
        }

        // Update order in database
        // Update order in database
        // NOTE: Midtrans 'order_id' matches our internal Order 'id'.
        const order = await prisma.order.update({
            where: { id: order_id },
            data: {
                status: dbStatus,
                transactionId: transaction_id,
                paymentType: payment_type,
            },
            include: {
                project: true,
            }
        });

        // If payment is settled, activate the project and mark estimate as paid
        if (dbStatus === "settled" && order.project) {
            const currentPaid = order.project.paidAmount || 0;
            const newPaid = currentPaid + order.amount;

            let paymentStatus = "UNPAID";
            if (order.type === "FULL" || order.type === "REPAYMENT") {
                paymentStatus = "PAID";
            } else if (order.type === "DP") {
                paymentStatus = "PARTIAL";
            }

            // Update project status
            await prisma.project.update({
                where: { id: order.project.id },
                data: {
                    status: "queue", // Start working on it
                    paymentStatus: paymentStatus,
                    paidAmount: newPaid
                }
            });

            if (order.project.estimateId) {
                // Only mark estimate as paid if fully paid or if we want to lock it after DP?
                // Usually estimate is "accepted/paid" once project starts. 
                // Let's keep it "paid" if at least DP is in.
                await prisma.estimate.update({
                    where: { id: order.project.estimateId },
                    data: { status: "paid" }
                });
            }

            // --- COMMISSION LOGIC ---
            await processAffiliateCommission(order_id, order.amount, order.paymentMetadata);
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[MIDTRANS_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
