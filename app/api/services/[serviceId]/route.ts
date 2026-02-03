
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

const billingPeriodMap: Record<string, string> = {
    'monthly': 'every-month',
    'yearly': 'every-year',
    'one_time': 'once'
};

export async function DELETE(req: NextRequest, props: { params: Promise<{ serviceId: string }> }) {
    const params = await props.params;
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.serviceId;

    try {
        const service = await prisma.service.findUnique({ where: { id } });
        if (service?.creemProductId) {
            try {
                const { creem } = await import("@/lib/creem");
                const sdk = await creem();
                await sdk.products.delete({ productId: service.creemProductId });
            } catch (e) {
                console.error("Failed to delete from Creem:", e);
            }
        }
        await prisma.service.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Service Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ serviceId: string }> }) {
    const params = await props.params;
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.serviceId;

    try {
        const formData = await req.formData();
        const title = formData.get("title")?.toString();
        const title_id = formData.get("title_id")?.toString();
        const description = formData.get("description")?.toString();
        const description_id = formData.get("description_id")?.toString();
        const priceRaw = formData.get("price")?.toString();
        const currency = formData.get("currency")?.toString() || "USD";
        const interval = formData.get("interval")?.toString() || "one_time";
        const featuresRaw = formData.get("features")?.toString() || "";
        const featuresIdRaw = formData.get("features_id")?.toString() || "";
        const imageFile = formData.get("image") as File;

        // Validation
        if (!title || !description || !title_id || !description_id || !priceRaw) {
            console.error("Missing required fields in PUT /api/services/[id]", { title, title_id, hasDescription: !!description, hasDescriptionId: !!description_id, priceRaw });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const price = parseFloat(priceRaw);
        if (isNaN(price)) {
            return NextResponse.json({ error: "Invalid price format" }, { status: 400 });
        }

        const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
        const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

        const data: Record<string, unknown> = {
            title,
            title_id,
            description,
            description_id,
            price,
            currency,
            interval,
            features,
            features_id
        };

        if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            try {
                const { uploadFile } = await import("@/lib/storage");
                data.image = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
            } catch (storageError) {
                console.error("Storage upload failed during update:", storageError);
            }
        }

        // Creem Sync Logic
        try {
            const { creem } = await import("@/lib/creem");
            const sdk = await creem();
            const existingService = await prisma.service.findUnique({ where: { id } });

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
            where: { id },
            data: data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("CRITICAL Update Service Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
