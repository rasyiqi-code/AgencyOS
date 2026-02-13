"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";

// Cast prisma untuk akses model baru (DigitalOrder relation di License)
// Prisma client telah di-generate, namun TS server mungkin belum mengenali tipe baru
const db = prisma as any;

/**
 * Custom key generator: AGE-XXXX-XXXX-XXXX
 * Format unik untuk license key produk digital
 */
function generateKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `AGE-${segment()}-${segment()}-${segment()}`;
}

/**
 * Generate lisensi setelah order berhasil dibayar.
 * Menghitung tanggal kadaluarsa untuk produk subscription.
 */
export async function generateLicenseForOrder(orderId: string) {
    try {
        const order = await db.digitalOrder.findUnique({
            where: { id: orderId },
            include: { product: true, license: true }
        });

        if (!order) throw new Error("Order not found");
        if (order.status !== 'PAID') throw new Error("Order not paid");
        if (order.license) return { success: true, license: order.license };

        const key = generateKey();

        // Hitung masa berlaku untuk subscription
        let expiresAt = undefined;
        if (order.product.purchaseType === 'subscription') {
            const now = new Date();
            if (order.product.interval === 'month') {
                now.setMonth(now.getMonth() + 1);
            } else if (order.product.interval === 'year') {
                now.setFullYear(now.getFullYear() + 1);
            }
            expiresAt = now;
        }

        const license = await prisma.license.create({
            data: {
                key,
                productId: order.productId,
                userId: order.userId,
                expiresAt,
                maxActivations: 1,
                status: 'active'
            }
        });

        // Update order dengan licenseId
        await db.digitalOrder.update({
            where: { id: orderId },
            data: { licenseId: license.id }
        });

        return { success: true, license };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Regenerasi license key. Key lama akan invalida otomatis.
 * Aktivasi di-reset ke 0 dan metadata dikosongkan.
 */
export async function regenerateLicense(licenseId: string) {
    try {
        const license = await prisma.license.findUnique({
            where: { id: licenseId }
        });

        if (!license) throw new Error("License not found");

        const newKey = generateKey();

        const updated = await prisma.license.update({
            where: { id: licenseId },
            data: {
                key: newKey,
                activations: 0,
                metadata: {}
            }
        });

        revalidatePath('/dashboard/my-products');
        return { success: true, license: updated };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Mengambil semua lisensi milik user tertentu beserta data produk terkait.
 * Digunakan oleh halaman My Products di client dashboard.
 */
export async function getClientLicenses(userId: string) {
    try {
        const licenses = await prisma.license.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, licenses };
    } catch (error: any) {
        return { success: false, error: error.message, licenses: [] };
    }
}
