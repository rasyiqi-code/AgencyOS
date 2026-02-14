"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdmin } from "@/lib/shared/auth-helpers";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    type: z.string().default("plugin"), // plugin, template
    purchaseType: z.enum(["one_time", "subscription"]).default("one_time"),
    interval: z.string().optional(), // month, year
    isActive: z.boolean().default(true),
    image: z.string().optional(),
    fileUrl: z.string().optional(),
});

export type DigitalProductFormValues = z.infer<typeof productSchema>;

export async function createDigitalProduct(data: DigitalProductFormValues) {
    try {
        // Auth check: hanya admin yang boleh membuat produk digital
        if (!await isAdmin()) throw new Error("Unauthorized");

        const validated = productSchema.parse(data);

        // check unique slug
        const existing = await prisma.product.findUnique({ where: { slug: validated.slug } });
        if (existing) throw new Error("Slug already exists");

        const product = await prisma.product.create({
            data: {
                ...validated,
                type: validated.type,
            }
        });

        revalidatePath('/admin/products');
        revalidatePath('/products');
        return { success: true, product };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

export async function updateDigitalProduct(id: string, data: Partial<DigitalProductFormValues>) {
    try {
        // Auth check: hanya admin yang boleh update produk digital
        if (!await isAdmin()) throw new Error("Unauthorized");

        const validated = productSchema.partial().parse(data);

        const product = await prisma.product.update({
            where: { id },
            data: validated
        });

        revalidatePath('/admin/products');
        revalidatePath('/products');
        return { success: true, product };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

export async function deleteDigitalProduct(id: string) {
    try {
        // Auth check: hanya admin yang boleh hapus produk digital
        if (!await isAdmin()) throw new Error("Unauthorized");

        // Cek apakah ada license atau digital order yang terkait
        const [licenseCount, orderCount] = await Promise.all([
            prisma.license.count({ where: { productId: id } }),
            prisma.digitalOrder.count({ where: { productId: id } }),
        ]);

        if (licenseCount > 0) {
            return {
                success: false,
                error: `Produk memiliki ${licenseCount} license aktif. Hapus license terlebih dahulu.`
            };
        }

        if (orderCount > 0) {
            return {
                success: false,
                error: `Produk memiliki ${orderCount} order terkait. Tidak bisa dihapus.`
            };
        }

        await prisma.product.delete({ where: { id } });
        revalidatePath('/admin/products');
        revalidatePath('/products');
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

export async function getDigitalProducts(onlyActive = true) {
    return await prisma.product.findMany({
        where: onlyActive ? { isActive: true } : {},
        orderBy: { createdAt: 'desc' }
    });
}

export async function getDigitalProductBySlug(slug: string) {
    return await prisma.product.findUnique({
        where: { slug }
    });
}
