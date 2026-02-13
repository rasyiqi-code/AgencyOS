"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateDigitalProduct(id: string, data: Partial<DigitalProductFormValues>) {
    try {
        const validated = productSchema.partial().parse(data);

        const product = await prisma.product.update({
            where: { id },
            data: validated
        });

        revalidatePath('/admin/products');
        revalidatePath('/products');
        return { success: true, product };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteDigitalProduct(id: string) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/admin/products');
        revalidatePath('/products');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
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
