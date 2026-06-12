"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { generateKey, secureRandomInt } from "@/lib/utils/crypto";
import { getSnap } from "@/lib/integrations/midtrans";
import { paymentService } from "@/lib/server/payment-service";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

/**
 * Mengambil semua lisensi (hanya untuk Admin)
 */
export async function getLicenses(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
}) {
    if (!await isAdmin()) {
        throw new Error("Unauthorized");
    }

    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (status && status !== "ALL") {
        where.status = status.toLowerCase();
    }

    if (search) {
        where.OR = [
            { key: { contains: search, mode: "insensitive" } },
            { userId: { contains: search, mode: "insensitive" } },
            { product: { name: { contains: search, mode: "insensitive" } } },
        ];
    }

    const [licenses, total] = await Promise.all([
        prisma.license.findMany({
            where,
            include: {
                product: {
                    select: { name: true, price: true, currency: true }
                },
                activations: true
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma.license.count({ where })
    ]);

    return {
        licenses,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

/**
 * Mengambil semua lisensi milik user yang sedang login
 */
export async function getUserLicenses() {
    const user = await hexclaveServerApp.getUser();
    if (!user) return [];

    try {
        return await prisma.license.findMany({
            where: { userId: user.id },
            include: {
                product: true,
                activations: true
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("GET_USER_LICENSES_ERROR", error);
        return [];
    }
}

/**
 * Membuat lisensi secara manual (hanya untuk Admin)
 */
export async function createManualLicense(formData: FormData) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    const userId = formData.get("userId")?.toString();
    const productId = formData.get("productId")?.toString();
    const maxActivationsRaw = formData.get("maxActivations")?.toString();
    const expiresAtRaw = formData.get("expiresAt")?.toString();

    if (!userId || !productId) {
        return { error: "User ID dan Produk wajib diisi" };
    }

    const maxActivations = parseInt(maxActivationsRaw || "1", 10);
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

    try {
        const licenseKey = generateKey();

        const license = await prisma.license.create({
            data: {
                key: licenseKey,
                userId,
                productId,
                maxActivations: isNaN(maxActivations) ? 1 : maxActivations,
                expiresAt,
                status: "active"
            }
        });

        revalidatePath("/admin/system/licenses");
        return { success: true, data: license };
    } catch (error) {
        console.error("CREATE_MANUAL_LICENSE_ERROR", error);
        return { error: "Gagal membuat lisensi baru." };
    }
}

/**
 * Menangguhkan (suspend) atau mengaktifkan kembali lisensi (hanya untuk Admin)
 */
export async function toggleLicenseStatus(licenseId: string) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    try {
        const license = await prisma.license.findUnique({
            where: { id: licenseId }
        });

        if (!license) {
            return { error: "Lisensi tidak ditemukan" };
        }

        const newStatus = license.status === "active" ? "suspended" : "active";

        const updated = await prisma.license.update({
            where: { id: licenseId },
            data: { status: newStatus }
        });

        revalidatePath("/admin/system/licenses");
        return { success: true, status: updated.status };
    } catch (error) {
        console.error("TOGGLE_LICENSE_STATUS_ERROR", error);
        return { error: "Gagal memperbarui status lisensi." };
    }
}

/**
 * Me-regenerasi kunci lisensi (hanya untuk Admin)
 */
export async function regenerateLicenseKey(licenseId: string) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    try {
        const newKey = generateKey();

        await prisma.license.update({
            where: { id: licenseId },
            data: { key: newKey }
        });

        revalidatePath("/admin/system/licenses");
        return { success: true, key: newKey };
    } catch (error) {
        console.error("REGENERATE_LICENSE_KEY_ERROR", error);
        return { error: "Gagal me-regenerasi kunci lisensi." };
    }
}

/**
 * Menghapus lisensi (hanya untuk Admin)
 */
export async function deleteLicense(licenseId: string) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.license.delete({
            where: { id: licenseId }
        });

        revalidatePath("/admin/system/licenses");
        return { success: true };
    } catch (error) {
        console.error("DELETE_LICENSE_ERROR", error);
        return { error: "Gagal menghapus lisensi." };
    }
}

/**
 * Mendaftarkan domain baru ke lisensi dari sisi User
 */
export async function activateUserLicenseDomain(licenseId: string, domain: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const cleanDomain = domain
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .split("/")[0]
        .toLowerCase();

    if (!cleanDomain) return { error: "Domain tidak valid" };

    try {
        const license = await prisma.license.findFirst({
            where: { id: licenseId, userId: user.id },
            include: { activations: true }
        });

        if (!license) return { error: "Lisensi tidak ditemukan" };
        if (license.status !== "active") return { error: "Lisensi tidak dalam status aktif" };

        if (license.activations.length >= license.maxActivations) {
            return { error: `Batas aktivasi telah tercapai (maksimal ${license.maxActivations} domain).` };
        }

        const alreadyActive = license.activations.some(a => a.domain === cleanDomain);
        if (alreadyActive) return { error: "Domain ini sudah aktif" };

        await prisma.licenseActivation.create({
            data: {
                licenseId,
                domain: cleanDomain
            }
        });

        revalidatePath("/dashboard/licenses");
        return { success: true };
    } catch (error) {
        console.error("ACTIVATE_USER_DOMAIN_ERROR", error);
        return { error: "Gagal mengaktifkan domain." };
    }
}

/**
 * Menghapus domain terdaftar dari lisensi dari sisi User
 */
export async function deactivateUserLicenseDomain(licenseId: string, activationId: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const license = await prisma.license.findFirst({
            where: { id: licenseId, userId: user.id }
        });

        if (!license) return { error: "Lisensi tidak valid" };

        await prisma.licenseActivation.delete({
            where: { id: activationId, licenseId }
        });

        revalidatePath("/dashboard/licenses");
        return { success: true };
    } catch (error) {
        console.error("DEACTIVATE_USER_DOMAIN_ERROR", error);
        return { error: "Gagal menonaktifkan domain." };
    }
}

/**
 * Membuat transaksi pembelian lisensi (Midtrans Snap) untuk user yang login
 */
export async function buySoftwareLicense(productId: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const product = await prisma.softwareProduct.findUnique({
            where: { id: productId }
        });

        if (!product || !product.isActive) {
            return { error: "Produk tidak tersedia untuk dibeli" };
        }

        // Buat Order ID unik
        const orderId = `ORDSW-${Date.now()}-${secureRandomInt(0, 1000)}`;

        // Ambil nominal rupiah (Midtrans mewajibkan IDR)
        let amount = product.price;
        let currency = product.currency;
        let idrAmount = amount;
        const { clientKey, isProduction } = await paymentGatewayService.getMidtransConfig();

        if (currency === "USD") {
            const { idrAmount: converted } = await paymentService.convertToIDR(amount);
            idrAmount = Math.ceil(converted);
        }

        // Panggil Midtrans Snap untuk membuat token
        const snap = await getSnap();
        const transaction = await snap.createTransaction({
            transaction_details: {
                order_id: orderId,
                gross_amount: idrAmount,
            },
            customer_details: {
                first_name: user.displayName || "Client",
                email: user.primaryEmail,
            },
            item_details: [
                {
                    id: product.id,
                    price: idrAmount,
                    quantity: 1,
                    name: product.name.substring(0, 50),
                }
            ]
        });

        // Simpan Order di database
        await prisma.order.create({
            data: {
                id: orderId,
                amount: amount, // Nilai asli produk (USD atau IDR)
                userId: user.id,
                status: "pending",
                type: "SOFTWARE_LICENSE",
                currency: currency,
                snapToken: transaction.token,
                paymentMetadata: {
                    productId: product.id,
                    redirectUrl: transaction.redirect_url
                }
            }
        });

        return { 
            success: true, 
            snapToken: transaction.token,
            clientKey,
            isProduction,
            orderId
        };
    } catch (error: any) {
        console.error("BUY_SOFTWARE_LICENSE_ERROR", error);
        return { error: error.message || "Gagal menginisialisasi pembayaran." };
    }
}
