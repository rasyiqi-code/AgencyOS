
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
                await creem.products.delete({ productId: service.creemProductId });
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
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const interval = formData.get("interval") as string;
        const featuresRaw = formData.get("features") as string;
        const imageFile = formData.get("image") as File;

        let features: string[] = [];
        if (featuresRaw.includes('<li>')) {
            const matches = featuresRaw.match(/<li>(.*?)<\/li>/g);
            if (matches) {
                features = matches.map(m => m.replace(/<\/?li>/g, '').trim());
            }
        } else {
            features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
        }

        const data: {
            title: string;
            description: string;
            price: number;
            interval: string;
            features: string[];
            image?: string;
            creemProductId?: string;
        } = {
            title,
            description,
            price,
            interval,
            features
        };

        if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            const { uploadFile } = await import("@/lib/storage");
            data.image = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        }

        // Creem Sync Logic
        let newCreemId: string | null = null;
        try {
            const { creem } = await import("@/lib/creem");
            const existingService = await prisma.service.findUnique({ where: { id } });

            if (existingService?.creemProductId) {
                // Update Logic
                const syncPromise = creem.products.update({
                    productId: existingService.creemProductId,
                    name: title,
                    description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                    price: Math.round(price * 100),
                    billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "every-month" | "every-year" | "every-three-months" | "every-six-months" | "once" | undefined,
                    imageUrl: data.image || undefined
                });
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Creem Sync Timeout")), 8000));

                try {
                    await Promise.race([syncPromise, timeoutPromise]);
                } catch (innerError: unknown) {
                    if (innerError && typeof innerError === 'object' && 'status' in innerError && innerError.status === 404) {
                        const newProduct = await creem.products.create({
                            name: title,
                            description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                            price: Math.round(price * 100),
                            currency: "USD",
                            billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                            billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "every-month" | "every-year" | "every-three-months" | "every-six-months" | "once" | undefined,
                            taxMode: "inclusive",
                            taxCategory: "digital-goods-service",
                            imageUrl: data.image || undefined
                        });
                        newCreemId = newProduct.id;
                    } else {
                        throw innerError;
                    }
                }
            } else {
                // Create Logic
                const creemProduct = await creem.products.create({
                    name: title,
                    description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                    price: Math.round(price * 100),
                    currency: "USD",
                    billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                    billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "every-month" | "every-year" | "every-three-months" | "every-six-months" | "once" | undefined,
                    taxMode: "inclusive",
                    taxCategory: "digital-goods-service",
                    imageUrl: data.image || undefined
                });
                newCreemId = creemProduct.id;
            }
        } catch (e) {
            console.error("Creem sync failed", e);
        }

        if (newCreemId) {
            data.creemProductId = newCreemId;
        }

        const updated = await prisma.service.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update Service Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
