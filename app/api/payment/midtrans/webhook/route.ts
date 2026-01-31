import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

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
        // NOTE: Midtrans 'order_id' is actually our 'transactionId' (e.g. ORDER-XXX-TIMESTAMP)
        // We must query by transactionId, not the internal Order ID.
        await prisma.order.update({
            where: { transactionId: order_id },
            data: {
                status: dbStatus,
                transactionId: transaction_id,
                paymentType: payment_type,
            },
        });

        // If payment is settled, we might want to update the project status or notify the architect
        if (dbStatus === "settled") {
            const order = await prisma.order.findUnique({
                where: { id: order_id },
                include: { project: true }
            });

            if (order?.projectId) {
                // Update project status if needed, e.g., move from "queue" to "dev"
                await prisma.project.update({
                    where: { id: order.projectId },
                    data: { status: "dev" }
                });
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[MIDTRANS_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
