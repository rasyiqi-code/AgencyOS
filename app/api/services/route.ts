
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

const billingPeriodMap: Record<string, string> = {
    'monthly': 'every-month',
    'yearly': 'every-year',
    'one_time': 'once'
};

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(services);
    } catch (error) {
        console.error("Service API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();

        // Check if sync request or create request
        const action = formData.get("action");
        if (action === 'sync') {
            // SYNC LOGIC
            console.warn("Creem API: List Products not supported by current endpoint. Import skipped.");
            return NextResponse.json({ success: true, count: 0, warning: "Import checks skipped: API limitation" });
        }

        // CREATE LOGIC
        const title = formData.get("title") as string;
        const title_id = formData.get("title_id") as string;
        const description = formData.get("description") as string;
        const description_id = formData.get("description_id") as string;
        const price = parseFloat(formData.get("price") as string);
        const currency = (formData.get("currency") as string) || "USD";
        const interval = formData.get("interval") as string;
        const featuresRaw = formData.get("features") as string;
        const featuresIdRaw = formData.get("features_id") as string;
        const imageFile = formData.get("image") as File;

        const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
        const features_id = featuresIdRaw ? featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '') : [];

        let imageUrl = null;
        if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            const { uploadFile } = await import("@/lib/storage");
            imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        }

        let creemProductId = null;
        try {
            const { creem } = await import("@/lib/creem");
            const sdk = await creem();
            const creemProduct = await sdk.products.create({
                name: title,
                description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
                price: Math.round(price * 100),
                currency: currency,
                billingType: interval === 'one_time' ? 'onetime' : 'recurring',
                billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as "every-month" | "every-year" | "every-three-months" | "every-six-months" | "once" | undefined,
                taxMode: "inclusive",
                taxCategory: "digital-goods-service",
                imageUrl: imageUrl || undefined
            });
            creemProductId = creemProduct.id;
        } catch (error) {
            console.error("Failed to create Creem product:", error);
        }

        const service = await prisma.service.create({
            // Force type check
            data: {
                title,
                title_id,
                description,
                description_id,
                price,
                currency,
                interval,
                features,
                features_id,
                image: imageUrl,
                creemProductId
            }
        });

        return NextResponse.json(service, { status: 201 });

    } catch (error) {
        console.error("Service API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
