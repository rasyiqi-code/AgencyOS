"use server";

import { prisma } from "@/lib/config/db";
import { generateLicenseForOrder } from "./licenses";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { processAffiliateCommission } from "@/lib/affiliate/commission";

const db = prisma;

/**
 * Membuat DigitalOrder baru di database.
 * Dipanggil oleh API route `/api/digital-checkout`.
 */
export async function createDigitalOrder(data: {
    productId: string;
    userId?: string;
    userEmail: string;
    userName?: string;
    amount: number;
}) {
    try {
        const order = await db.digitalOrder.create({
            data: {
                productId: data.productId,
                userId: data.userId || null,
                userEmail: data.userEmail,
                userName: data.userName || null,
                amount: data.amount,
                status: "PENDING",
            },
        });

        return { success: true, order };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[CREATE_DIGITAL_ORDER_ERROR]", error);
        return { success: false, error: message };
    }
}

/**
 * Mengambil semua DigitalOrder (untuk admin dashboard).
 * Include relasi product dan license.
 * Auth check: hanya admin yang boleh mengakses.
 */
export async function getDigitalOrders() {
    try {
        // Auth check: pastikan hanya admin yang bisa akses semua orders
        if (!await isAdmin()) {
            return { success: false, error: "Unauthorized", orders: [] };
        }

        const orders = await db.digitalOrder.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                product: { select: { name: true, slug: true } },
                license: { select: { key: true, status: true } },
            },
        });

        return { success: true, orders };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[GET_DIGITAL_ORDERS_ERROR]", error);
        return { success: false, error: message, orders: [] };
    }
}

/**
 * Menyelesaikan pembayaran DigitalOrder setelah konfirmasi dari webhook Midtrans.
 * Update status ke PAID dan generate license key otomatis.
 *
 * @param orderId - ID DigitalOrder yang akan diselesaikan
 * @param paymentId - Transaction ID dari Midtrans (opsional)
 */
export async function completeDigitalOrder(orderId: string, paymentId?: string) {
    try {
        // Update status order ke PAID
        const order = await db.digitalOrder.update({
            where: { id: orderId },
            data: {
                status: "PAID",
                paymentId: paymentId || null,
            },
        });

        // Generate license key otomatis setelah pembayaran sukses
        const licenseResult = await generateLicenseForOrder(orderId);

        if (!licenseResult.success) {
            console.error(`[COMPLETE_ORDER] License generation failed for ${orderId}:`, licenseResult.error);
        }

        // Process Affiliate Commission (jika ada referral)
        // Order harus sudah PAID agar komisi valid
        await processAffiliateCommission(orderId, order.amount, order.paymentMetadata);

        return { success: true, order, license: licenseResult };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[COMPLETE_DIGITAL_ORDER_ERROR]", error);
        return { success: false, error: message };
    }
}
