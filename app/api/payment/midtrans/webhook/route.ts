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
            return await handleDigitalOrderWebhook(order_id, transaction_status, transaction_id, payment_type);
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
    transactionId: string,
    paymentType?: string
) {
    // Cari order berdasarkan paymentId, karena order_id dari Midtrans
    // mengandung suffix timestamp (contoh: DIGI-xxx-1739443234567)
    // yang tidak sama dengan ID asli di database (DIGI-xxx).
    // Field paymentId sudah disimpan saat charge di /api/digital-payment/charge.
    const digitalOrder = await prisma.digitalOrder.findFirst({
        where: { paymentId: orderId },
    });

    if (!digitalOrder) {
        console.error(`[MIDTRANS_WEBHOOK] Digital order not found for paymentId: ${orderId}`);
        return NextResponse.json(
            { status: "error", message: "Digital order not found" },
            { status: 404 }
        );
    }

    // Idempotency: jika order sudah PAID, skip untuk mencegah proses duplikat
    if (digitalOrder.status === 'PAID') {
        console.log(`[MIDTRANS_WEBHOOK] Digital order ${digitalOrder.id} already PAID, skipping.`);
        return NextResponse.json({ status: "ok", message: "Already processed" });
    }

    const actualOrderId = digitalOrder.id;

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
        // Pembayaran berhasil → selesaikan order + generate license
        const result = await completeDigitalOrder(actualOrderId, transactionId, paymentType);

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
        await prisma.digitalOrder.update({
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

    // Cari order di database.
    // order_id dari Midtrans bisa berupa uniqueTransactionId (orderId-timestamp)
    // yang dibuat saat charge via Core API. Oleh karena itu, coba cari:
    // 1. Berdasarkan id langsung (untuk Snap checkout)
    // 2. Berdasarkan transactionId (untuk Core API charge)
    let existingOrder = await prisma.order.findUnique({ where: { id: orderId } });

    if (!existingOrder) {
        existingOrder = await prisma.order.findUnique({
            where: { transactionId: orderId },
        });
    }

    if (!existingOrder) {
        console.error(`[MIDTRANS_WEBHOOK] Order not found for order_id: ${orderId}`);
        return NextResponse.json(
            { status: "error", message: "Order not found" },
            { status: 404 }
        );
    }

    // Idempotency: jika order sudah settled, skip untuk mencegah double-increment paidAmount
    if (existingOrder.status === 'settled' && (transactionStatus === 'capture' || transactionStatus === 'settlement')) {
        console.log(`[MIDTRANS_WEBHOOK] Order ${existingOrder.id} already settled, skipping.`);
        return NextResponse.json({ status: "ok", message: "Already processed" });
    }

    // Update order di database menggunakan ID asli
    const order = await prisma.order.update({
        where: { id: existingOrder.id },
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

        // Normalize order.amount to USD if it was processed in IDR
        const orderRate = order.exchangeRate || 1;
        const normalizedOrderAmount = order.currency === 'IDR' && order.amount > 5000
            ? order.amount / orderRate
            : order.amount;

        const newPaid = currentPaid + normalizedOrderAmount;

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

        // Commission logic — gunakan existingOrder.id (DB ID asli),
        // bukan orderId dari Midtrans yang bisa berupa uniqueTransactionId
        await processAffiliateCommission(existingOrder.id, order.amount, order.paymentMetadata);
    }

    return NextResponse.json({ status: "ok" });
}

