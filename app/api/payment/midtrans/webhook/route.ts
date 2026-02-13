import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { processAffiliateCommission } from "@/lib/affiliate/commission";
import { completeDigitalOrder } from "@/app/actions/digital-orders";

/**
 * Midtrans Webhook Handler
 *
 * Menangani notifikasi pembayaran dari Midtrans.
 * Mendukung dua jenis order:
 * - Order biasa (project/service) → prefix ORDER-
 * - DigitalOrder (produk digital) → prefix DIGI-
 */
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

        // Verifikasi signature dari Midtrans
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

        // ============================================
        // DIGITAL ORDER (prefix DIGI-)
        // ============================================
        if (order_id.startsWith("DIGI-")) {
            return await handleDigitalOrderWebhook(order_id, transaction_status, transaction_id);
        }

        // ============================================
        // ORDER BIASA (project/service)
        // ============================================
        return await handleProjectOrderWebhook(
            order_id, transaction_status, transaction_id, payment_type
        );

    } catch (error) {
        console.error("[MIDTRANS_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * Handle webhook untuk DigitalOrder (produk digital).
 * Jika settlement → update status PAID + generate license.
 */
async function handleDigitalOrderWebhook(
    orderId: string,
    transactionStatus: string,
    transactionId: string
) {
    const db = prisma as any;

    // Cari order berdasarkan paymentId, karena order_id dari Midtrans
    // mengandung suffix timestamp (contoh: DIGI-xxx-1739443234567)
    // yang tidak sama dengan ID asli di database (DIGI-xxx).
    // Field paymentId sudah disimpan saat charge di /api/digital-payment/charge.
    const digitalOrder = await db.digitalOrder.findFirst({
        where: { paymentId: orderId },
    });

    if (!digitalOrder) {
        console.error(`[MIDTRANS_WEBHOOK] Digital order not found for paymentId: ${orderId}`);
        return NextResponse.json(
            { status: "error", message: "Digital order not found" },
            { status: 404 }
        );
    }

    const actualOrderId = digitalOrder.id;

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
        // Pembayaran berhasil → selesaikan order + generate license
        const result = await completeDigitalOrder(actualOrderId, transactionId);

        if (!result.success) {
            console.error(`[MIDTRANS_WEBHOOK] Failed to complete digital order ${actualOrderId}:`, result.error);
            return NextResponse.json({ status: "error", message: result.error }, { status: 500 });
        }

        console.log(`[MIDTRANS_WEBHOOK] Digital order ${actualOrderId} completed with license`);
    } else if (
        transactionStatus === "deny" ||
        transactionStatus === "cancel" ||
        transactionStatus === "expire"
    ) {
        // Pembayaran gagal/expired → update status
        await db.digitalOrder.update({
            where: { id: actualOrderId },
            data: {
                status: transactionStatus === "expire" ? "EXPIRED" : "FAILED",
                paymentId: transactionId,
            },
        });

        console.log(`[MIDTRANS_WEBHOOK] Digital order ${actualOrderId} status: ${transactionStatus}`);
    }
    // Status "pending" → tidak perlu update, order sudah PENDING

    return NextResponse.json({ status: "ok" });
}

/**
 * Handle webhook untuk Order biasa (project/service).
 * Logic yang sudah ada sebelumnya.
 */
async function handleProjectOrderWebhook(
    orderId: string,
    transactionStatus: string,
    transactionId: string,
    paymentType: string
) {
    // Map Midtrans status ke database status
    let dbStatus = "pending";
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
        dbStatus = "settled";
    } else if (
        transactionStatus === "deny" ||
        transactionStatus === "cancel" ||
        transactionStatus === "expire"
    ) {
        dbStatus = transactionStatus;
    }

    // Update order di database
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: dbStatus,
            transactionId: transactionId,
            paymentType: paymentType,
        },
        include: { project: true },
    });

    // Jika pembayaran settled → aktifkan project
    if (dbStatus === "settled" && order.project) {
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
                status: "queue",
                paymentStatus: paymentStatus,
                paidAmount: newPaid,
            },
        });

        if (order.project.estimateId) {
            await prisma.estimate.update({
                where: { id: order.project.estimateId },
                data: { status: "paid" },
            });
        }

        // Commission logic
        await processAffiliateCommission(orderId, order.amount, order.paymentMetadata);
    }

    return NextResponse.json({ status: "ok" });
}

