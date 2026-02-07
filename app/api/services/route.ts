
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

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
            console.warn("Creem API: List Products not supported by current endpoint. Import skipped.");
            return NextResponse.json({ success: true, count: 0, warning: "Import checks skipped: API limitation" });
        }

        // CREATE LOGIC
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
            console.error("Missing required fields in POST /api/services", { title, title_id, hasDescription: !!description, hasDescriptionId: !!description_id, priceRaw });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const price = parseFloat(priceRaw);
        if (isNaN(price)) {
            return NextResponse.json({ error: "Invalid price format" }, { status: 400 });
        }

        const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
        const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

        let imageUrl = null;
        if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            try {
                const { uploadFile } = await import("@/lib/integrations/storage");
                imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
            } catch (storageError) {
                console.error("Storage upload failed:", storageError);
                // Continue without image or handle as error? For now continue.
            }
        }

        let creemProductId = null;
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
        console.error("CRITICAL Service API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
