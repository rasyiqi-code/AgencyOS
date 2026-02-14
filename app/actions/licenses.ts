"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { isAdmin, getCurrentUser } from "@/lib/shared/auth-helpers";

// Cast prisma untuk akses model baru (DigitalOrder relation di License)
// Prisma client telah di-generate, namun TS server mungkin belum mengenali tipe baru
const db = prisma;

/**
 * Custom key generator: AGE-XXXX-XXXX-XXXX
 * Format unik untuk license key produk digital.
 * Menggunakan crypto.randomBytes() untuk keamanan yang lebih baik.
 */
function generateKey() {
    // Generate 12 bytes random yang cryptographically secure
    const bytes = randomBytes(12);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (offset: number) =>
        Array.from({ length: 4 }, (_, i) => chars[bytes[offset + i] % chars.length]).join("");
    return `AGE-${segment(0)}-${segment(4)}-${segment(8)}`;
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

/**
 * Regenerasi license key. Key lama akan invalida otomatis.
 * Aktivasi di-reset ke 0 dan metadata dikosongkan.
 */
export async function regenerateLicense(licenseId: string) {
    try {
        // Auth check: hanya admin atau pemilik license yang boleh regenerate
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const license = await prisma.license.findUnique({
            where: { id: licenseId }
        });

        if (!license) throw new Error("License not found");

        // Verifikasi ownership: pemilik license atau admin
        const admin = await isAdmin();
        if (license.userId !== user.id && !admin) {
            throw new Error("Forbidden");
        }

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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

/**
 * Mengambil semua lisensi milik user yang sedang login beserta data produk terkait.
 * Digunakan oleh halaman My Products di client dashboard.
 * UserId diambil dari session untuk mencegah IDOR.
 */
export async function getClientLicenses() {
    try {
        // Auth check: ambil userId dari session, bukan dari parameter
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const licenses = await prisma.license.findMany({
            where: { userId: user.id },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, licenses };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message, licenses: [] };
    }
}
