"use server";

import { prisma } from "@/lib/config/db";
import { generateLicenseForOrder } from "./licenses";

const db = prisma as any;

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
    } catch (error: any) {
        console.error("[CREATE_DIGITAL_ORDER_ERROR]", error);
        return { success: false, error: error.message };
    }
}

/**
 * Mengambil semua DigitalOrder (untuk admin dashboard).
 * Include relasi product dan license.
 */
export async function getDigitalOrders() {
    try {
        const orders = await db.digitalOrder.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                product: { select: { name: true, slug: true } },
                license: { select: { key: true, status: true } },
            },
        });

        return { success: true, orders };
    } catch (error: any) {
        console.error("[GET_DIGITAL_ORDERS_ERROR]", error);
        return { success: false, error: error.message, orders: [] };
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

        return { success: true, order, license: licenseResult };
    } catch (error: any) {
        console.error("[COMPLETE_DIGITAL_ORDER_ERROR]", error);
        return { success: false, error: error.message };
    }
}
