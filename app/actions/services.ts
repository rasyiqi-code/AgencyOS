"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { slugify } from "@/lib/shared/utils";
import { Prisma } from "@prisma/client";

const billingPeriodMap: Record<string, string> = {
    'monthly': 'every-month',
    'yearly': 'every-year',
    'one_time': 'once'
};

export async function createService(formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const action = formData.get("action");
    if (action === 'sync') {
        return { success: true, count: 0, warning: "Import checks skipped: API limitation" };
    }

    const title = formData.get("title")?.toString();
    const title_id = formData.get("title_id")?.toString();
    const description = formData.get("description")?.toString();
    const description_id = formData.get("description_id")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const originalPriceRaw = formData.get("originalPrice")?.toString();
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const featuresRaw = formData.get("features")?.toString() || "";
    const featuresIdRaw = formData.get("features_id")?.toString() || "";
    const imageFile = formData.get("image") as File;
    const slugInput = formData.get("slug")?.toString();

    if (!title || !description || !title_id || !description_id || !priceRaw) {
        return { error: "Missing required fields" };
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price)) return { error: "Invalid price format" };

    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
    const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        try {
            const { uploadFile } = await import("@/lib/integrations/storage");
            imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        } catch (storageError) {
            console.error("Storage upload failed:", storageError);
        }
    }

    let creemProductId: string | null = null;
    try {
        const { creem } = await import("@/lib/integrations/creem");
        const sdk = await creem();
        const creemProduct = await sdk.products.create({
            name: title,
            description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
            price: Math.round(price * 100),
            currency: currency,
            billingType: interval === 'one_time' ? 'onetime' : 'recurring',
            billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
            taxMode: "inclusive",
            taxCategory: "digital-goods-service",
            imageUrl: imageUrl || undefined
        });
        creemProductId = creemProduct.id;
    } catch (error) {
        console.error("Failed to create Creem product (Proceeding anyway):", error);
    }

    const service = await prisma.service.create({
        data: {
            title,
            title_id,
            description,
            description_id,
            price,
            originalPrice: originalPriceRaw ? parseFloat(originalPriceRaw) : null,
            priceType: formData.get("priceType")?.toString() || "FIXED",
            currency,
            interval,
            visibility: formData.get("visibility")?.toString() || "PUBLIC",
            features,
            features_id,
            addons: (() => {
                try {
                    const val = formData.get("addons");
                    return val ? JSON.parse(val.toString()) : [];
                } catch {
                    return [];
                }
            })(),
            addons_id: (() => {
                try {
                    const val = formData.get("addons_id");
                    return val ? JSON.parse(val.toString()) : [];
                } catch {
                    return [];
                }
            })(),
            image: imageUrl,
            creemProductId,
            slug: slugInput ? slugify(slugInput) : slugify(title)
        } as Prisma.ServiceCreateInput
    });

    revalidatePath("/admin/pm/services");
    return { success: true, data: service };
}

export async function updateService(serviceId: string, formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title")?.toString();
    const title_id = formData.get("title_id")?.toString();
    const description = formData.get("description")?.toString();
    const description_id = formData.get("description_id")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const originalPriceRaw = formData.get("originalPrice")?.toString();
    const priceType = formData.get("priceType")?.toString() || "FIXED";
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const featuresRaw = formData.get("features")?.toString() || "";
    const featuresIdRaw = formData.get("features_id")?.toString() || "";
    const imageFile = formData.get("image") as File;
    const imageUrlInput = formData.get("image_url")?.toString();
    const slugInput = formData.get("slug")?.toString();

    if (!title || !description || !title_id || !description_id || !priceRaw) {
        return { error: "Missing required fields" };
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price)) return { error: "Invalid price format" };

    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
    const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

    const addonsRaw = formData.get("addons")?.toString();
    const addonsIdRaw = formData.get("addons_id")?.toString();

    const data: Record<string, unknown> = {
        title,
        title_id,
        description,
        description_id,
        price,
        originalPrice: originalPriceRaw ? parseFloat(originalPriceRaw) : null,
        priceType,
        currency,
        interval,
        visibility: formData.get("visibility")?.toString() || "PUBLIC",
        features,
        features_id,
        addons: (() => {
            try {
                return addonsRaw ? JSON.parse(addonsRaw) : [];
            } catch {
                return [];
            }
        })(),
        addons_id: (() => {
            try {
                return addonsIdRaw ? JSON.parse(addonsIdRaw) : [];
            } catch {
                return [];
            }
        })(),
        slug: slugInput ? slugify(slugInput) : slugify(title)
    };

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        try {
            const { uploadFile } = await import("@/lib/integrations/storage");
            data.image = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        } catch (storageError) {
            console.error("Storage upload failed during update:", storageError);
        }
    } else if (imageUrlInput) {
        data.image = imageUrlInput;
    }

    try {
        const { creem } = await import("@/lib/integrations/creem");
        const sdk = await creem();
        const existingService = await prisma.service.findUnique({ where: { id: serviceId } });

        if (existingService?.creemProductId) {
            try {
                await sdk.products.update({
                    productId: existingService.creemProductId,
                    name: title,
                    description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                    price: Math.round(price * 100),
                    billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
                    imageUrl: (data.image as string) || undefined
                });
            } catch (innerError) {
                const errorObj = innerError as { status?: number; message?: string };
                if (errorObj?.status === 404) {
                    const newProduct = await sdk.products.create({
                        name: title,
                        description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                        price: Math.round(price * 100),
                        currency: currency,
                        billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                        billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
                        taxMode: "inclusive",
                        taxCategory: "digital-goods-service",
                        imageUrl: (data.image as string) || undefined
                    });
                    data.creemProductId = newProduct.id;
                } else {
                    throw innerError;
                }
            }
        } else {
            const creemProduct = await sdk.products.create({
                name: title,
                description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                price: Math.round(price * 100),
                currency: currency,
                billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "once" | "every-month" | "every-year",
                taxMode: "inclusive",
                taxCategory: "digital-goods-service",
                imageUrl: (data.image as string) || undefined
            });
            data.creemProductId = creemProduct.id;
        }
    } catch (e) {
        console.error("Creem sync failed during update:", e);
    }

    const updated = await prisma.service.update({
        where: { id: serviceId },
        data: data as Prisma.ServiceUpdateInput
    });

    revalidatePath("/admin/pm/services");
    return { success: true, data: updated };
}

export async function deleteService(serviceId: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (service?.creemProductId) {
        try {
            const { creem } = await import("@/lib/integrations/creem");
            const sdk = await creem();
            await sdk.products.delete({ productId: service.creemProductId });
        } catch (e) {
            console.error("Failed to delete from Creem:", e);
        }
    }

    await prisma.service.delete({ where: { id: serviceId } });

    revalidatePath("/admin/pm/services");
    return { success: true };
}
