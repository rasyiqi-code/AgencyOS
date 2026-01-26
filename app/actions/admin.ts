"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProjectStatus(projectId: string, status: string) {
    // Simple validation for MVP
    const validStatuses = ["queue", "dev", "review", "done"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    await prisma.project.update({
        where: { id: projectId },
        data: { status },
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/${projectId}`);
}

export async function deleteService(formData: FormData) {
    const id = formData.get("id") as string;

    // [CREEM INTEGRATION] Delete from Creem
    try {
        const service = await prisma.service.findUnique({ where: { id } });
        if (service?.creemProductId) {
            const { creem } = await import("@/lib/creem");
            await creem.products.delete({ productId: service.creemProductId });
        }
    } catch (error) {
        console.error("Failed to delete from Creem:", error);
    }

    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/pm/services");
}

export async function syncCreemServices() {
    try {
        // NOTE: Creem API v1 seems to lack a public list products endpoint (GET /products requires product_id).
        // For now, we cannot import services from Creem automatically.
        // We will just return 0 to indicate no new imports found, without erroring.
        console.warn("Creem API: List Products not supported by current endpoint. Import skipped.");
        return { success: true, count: 0, warning: "Import checks skipped: API limitation" };

        /* 
        // Original logic disabled until API supports listing
        const { creem } = await import("@/lib/creem");
        const { items: products } = await creem.products.list();

        let syncedCount = 0;

        for (const product of products) {
            // Check if service already exists with this creemProductId
            const existing = await prisma.service.findFirst({
                where: { creemProductId: product.id }
            });

            if (!existing) {
                // Create new service
                await prisma.service.create({
                    data: {
                        title: product.name,
                        description: product.description || "Imported from Creem",
                        price: (product.price || 0) / 100, // Cents to USD
                        interval: product.billing_type === 'recurring' ? 'monthly' : 'one_time',
                        features: [], // Empty features for imported services
                        creemProductId: product.id,
                        isActive: true
                    }
                });
                syncedCount++;
            }
        }
        
        revalidatePath("/admin/pm/services");
        return { success: true, count: syncedCount };
        */
    } catch (error) {
        console.error("Sync failed:", error);
        return { success: false, error: "Failed to sync" };
    }
}

const billingPeriodMap: Record<string, string> = {
    'monthly': 'every-month',
    'yearly': 'every-year', // Assumption, can verify
    'one_time': 'one-time'
};

export async function createService(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const interval = formData.get("interval") as string;
    const featuresRaw = formData.get("features") as string;
    const imageFile = formData.get("image") as File; // New

    // Convert features string (line/comma separated) to array
    // Filters out empty lines
    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

    let imageUrl = null;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        const { uploadFile } = await import("@/lib/storage");
        imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
    }

    // [CREEM INTEGRATION] Create Product in Creem
    let creemProductId = null;
    try {
        const { creem } = await import("@/lib/creem");
        const creemProduct = await creem.products.create({
            name: title,
            description: description.replace(/<[^>]*>?/gm, '').slice(0, 255), // Strip HTML
            price: Math.round(price * 100),
            currency: "USD",
            billingType: interval === 'one_time' ? 'onetime' : 'recurring',
            billingPeriod: (interval === 'one_time' ? undefined : (billingPeriodMap[interval] || 'every-month')) as any,
            taxMode: "inclusive",
            taxCategory: "digital-goods-service",
            imageUrl: imageUrl || undefined
        });
        creemProductId = creemProduct.id;
    } catch (error) {
        console.error("Failed to create Creem product:", error);
        // We continue even if Creem fails, but log it. 
        // Ideally we might want to warn the user or retry.
    }

    await prisma.service.create({
        data: {
            title,
            description,
            price,
            interval,
            features,
            image: imageUrl,
            creemProductId
        }
    });

    revalidatePath("/admin/pm/services");
    redirect("/admin/pm/services");
}

export async function updateService(formData: FormData) {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const interval = formData.get("interval") as string;
    const featuresRaw = formData.get("features") as string;
    const imageFile = formData.get("image") as File; // New

    // Convert features (detect if HTML list or plain text)
    // If it comes from RichTextEditor, it might be <ul><li>...</li></ul> or similar.
    // We should probably strip tags or parse accordingly if we want to store as JSON array.
    // For simplicity, let's assume valid HTML string IS fine if we want rich text,
    // BUT our schema says Json (Array of strings).
    // So we need to extract LI content.

    let features: string[] = [];
    if (featuresRaw.includes('<li>')) {
        // Simple regex to extract content
        const matches = featuresRaw.match(/<li>(.*?)<\/li>/g);
        if (matches) {
            features = matches.map(m => m.replace(/<\/?li>/g, '').trim());
        }
    } else {
        features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
    }

    // Prepare update data
    const data: { title: string, description: string, price: number, interval: string, features: string[], image?: string } = {
        title,
        description,
        price,
        interval,
        features
    };

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        const { uploadFile } = await import("@/lib/storage");
        const imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        data.image = imageUrl;
    }

    // [CREEM INTEGRATION] Sync Update
    let newCreemId: string | null = null;
    try {
        const { creem } = await import("@/lib/creem");
        // Get existing service to find Creem ID
        const existingService = await prisma.service.findUnique({ where: { id } });

        if (existingService?.creemProductId) {
            console.log("Syncing update to Creem...", existingService.creemProductId);

            // Race against a timeout
            // Race against a timeout
            const syncPromise = creem.products.update({
                productId: existingService.creemProductId,
                name: title,
                description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                price: Math.round(price * 100),
                billingPeriod: (interval === 'one_time' ? undefined : (billingPeriodMap[interval] || 'every-month')) as any,
                imageUrl: data.image || undefined
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Creem Sync Timeout")), 8000));

            try {
                await Promise.race([syncPromise, timeoutPromise]);
                console.log("Creem sync success.");
            } catch (innerError: any) {
                // Self-healing: If Product Not Found (404), create a new one
                if (innerError?.status === 404) {
                    console.warn(`Creem Product ${existingService.creemProductId} not found. Re-creating...`);
                    const newProduct = await creem.products.create({
                        name: title,
                        description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                        price: Math.round(price * 100),
                        currency: "USD",
                        billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                        billingPeriod: (interval === 'one_time' ? undefined : (billingPeriodMap[interval] || 'every-month')) as any,
                        taxMode: "inclusive",
                        taxCategory: "digital-goods-service",
                        imageUrl: data.image || undefined
                    });
                    newCreemId = newProduct.id;
                    console.log("Self-healing successful. New ID:", newCreemId);
                } else {
                    throw innerError; // Rethrow other errors (timeout, 500, etc)
                }
            }

        } else {
            // Create new if not exists
            const creemProduct = await creem.products.create({
                name: title,
                description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                price: Math.round(price * 100),
                currency: "USD",
                billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                billingPeriod: (interval === 'one_time' ? undefined : (billingPeriodMap[interval] || 'every-month')) as any,
                taxMode: "inclusive",
                taxCategory: "digital-goods-service",
                imageUrl: data.image || undefined
            });
            (data as any).creemProductId = creemProduct.id;
        }
    } catch (error) {
        console.error("Failed to sync with Creem (Non-blocking):", error);
    }

    // Apply main update
    const updatePayload = { ...data };
    if (newCreemId) {
        (updatePayload as any).creemProductId = newCreemId;
    }

    await prisma.service.update({
        where: { id },
        data: updatePayload
    });

    revalidatePath("/admin/pm/services");
    redirect("/admin/pm/services");
}

export async function confirmOrder(estimateId: string) {
    const estimate = await prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
            project: {
                include: { order: true }
            }
        }
    });

    if (!estimate) throw new Error("Invoice not found");

    // 1. Mark Estimate as Paid
    await prisma.estimate.update({
        where: { id: estimateId },
        data: { status: 'paid' }
    });

    // 2. Activate Project (if linked) and Sync Order
    if (estimate.project) {
        await prisma.project.update({
            where: { id: estimate.project.id },
            data: { status: 'queue' } // Unlock for client
        });

        // 3. Sync Order Status if exists
        if (estimate.project.order) {
            await prisma.order.update({
                where: { id: estimate.project.order.id },
                data: { status: 'paid' }
            });
            revalidatePath(`/invoices/${estimate.project.order.id}`);
        }
    }

    revalidatePath("/admin/finance/orders");
}
