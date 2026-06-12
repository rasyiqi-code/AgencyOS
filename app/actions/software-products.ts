"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { slugify } from "@/lib/shared/utils";

/**
 * Mengambil semua produk software yang aktif/terdaftar
 */
export async function getSoftwareProducts() {
    try {
        return await prisma.softwareProduct.findMany({
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("GET_SOFTWARE_PRODUCTS_ERROR", error);
        return [];
    }
}

/**
 * Membuat produk software baru (hanya untuk Admin)
 */
export async function createSoftwareProduct(formData: FormData) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;
    const priceRaw = formData.get("price")?.toString();
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const maxActivationsRaw = formData.get("maxActivations")?.toString();

    if (!name || !priceRaw) {
        return { error: "Nama produk dan harga wajib diisi" };
    }

    const price = parseFloat(priceRaw);
    const maxActivations = parseInt(maxActivationsRaw || "1", 10);

    if (isNaN(price)) return { error: "Format harga tidak valid" };

    try {
        const product = await prisma.softwareProduct.create({
            data: {
                name,
                slug: slugify(name),
                description,
                price,
                currency,
                interval,
                maxActivations: isNaN(maxActivations) ? 1 : maxActivations,
                isActive: true
            }
        });

        revalidatePath("/admin/system/products");
        revalidatePath("/dashboard/licenses");
        return { success: true, data: product };
    } catch (error: any) {
        console.error("CREATE_SOFTWARE_PRODUCT_ERROR", error);
        if (error.code === "P2002") {
            return { error: "Nama produk sudah terdaftar." };
        }
        return { error: "Gagal menambahkan produk." };
    }
}

/**
 * Memperbarui produk software (hanya untuk Admin)
 */
export async function updateSoftwareProduct(productId: string, formData: FormData) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;
    const priceRaw = formData.get("price")?.toString();
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const maxActivationsRaw = formData.get("maxActivations")?.toString();
    const isActive = formData.get("isActive") === "true";

    if (!name || !priceRaw) {
        return { error: "Nama produk dan harga wajib diisi" };
    }

    const price = parseFloat(priceRaw);
    const maxActivations = parseInt(maxActivationsRaw || "1", 10);

    if (isNaN(price)) return { error: "Format harga tidak valid" };

    try {
        const product = await prisma.softwareProduct.update({
            where: { id: productId },
            data: {
                name,
                slug: slugify(name),
                description,
                price,
                currency,
                interval,
                maxActivations: isNaN(maxActivations) ? 1 : maxActivations,
                isActive
            }
        });

        revalidatePath("/admin/system/products");
        revalidatePath("/dashboard/licenses");
        return { success: true, data: product };
    } catch (error) {
        console.error("UPDATE_SOFTWARE_PRODUCT_ERROR", error);
        return { error: "Gagal memperbarui produk." };
    }
}

/**
 * Menghapus produk software secara permanen (hanya untuk Admin)
 */
export async function deleteSoftwareProduct(productId: string) {
    if (!await isAdmin()) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.softwareProduct.delete({
            where: { id: productId }
        });

        revalidatePath("/admin/system/products");
        revalidatePath("/dashboard/licenses");
        return { success: true };
    } catch (error) {
        console.error("DELETE_SOFTWARE_PRODUCT_ERROR", error);
        return { error: "Gagal menghapus produk." };
    }
}
