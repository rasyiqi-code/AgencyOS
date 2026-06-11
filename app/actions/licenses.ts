"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { isAdmin, getCurrentUser } from "@/lib/shared/auth-helpers";
import { generateKey } from "@/lib/utils/crypto";

const db = prisma;

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

/**
 * Hapus lisensi secara permanen (untuk admin).
 */
export async function deleteLicense(licenseId: string) {
    try {
        if (!await isAdmin()) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.license.delete({
            where: { id: licenseId }
        });

        revalidatePath("/admin/licenses");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

/**
 * Membuat lisensi secara manual untuk inventaris internal agensi (Vault).
 * Mendukung penyimpanan nama client dan catatan tambahan ke kolom JSON metadata.
 */
export async function createManualLicense(data: {
    productId: string;
    key?: string;
    maxActivations: number;
    expiresAt?: string | null;
    clientName?: string;
    notes?: string;
}) {
    try {
        if (!await isAdmin()) {
            return { success: false, error: "Unauthorized" };
        }

        const key = data.key || generateKey();

        const license = await prisma.license.create({
            data: {
                key,
                productId: data.productId,
                maxActivations: data.maxActivations,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                status: "active",
                metadata: {
                    clientName: data.clientName || "",
                    notes: data.notes || ""
                }
            }
        });

        revalidatePath("/admin/licenses");
        return { success: true, data: license };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}
