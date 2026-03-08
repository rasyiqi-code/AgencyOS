import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { broadcastPushNotification } from "@/lib/server/push";

export async function GET() {
    // Auth check: hanya admin yang boleh melihat daftar produk
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { licenses: true },
                },
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("[PRODUCTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    // Auth check: hanya admin yang boleh membuat produk
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, slug, description, price, type, isActive, purchaseType, interval, image, fileUrl, name_id, description_id } = body;

        // Validasi: name dan slug wajib ada (price 0 diizinkan untuk produk gratis)
        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        // Cek slug unik sebelum create
        const existingProduct = await prisma.product.findUnique({
            where: { slug }
        });
        if (existingProduct) {
            return NextResponse.json({ error: "Slug already exists. Please use a different slug." }, { status: 409 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: Number(price) || 0,
                type: type || 'plugin',
                isActive: isActive ?? true,
                purchaseType: purchaseType || 'one_time',
                interval,
                image,
                fileUrl,
                name_id,
                description_id,
                currency: body.currency || 'USD',
            },
        });

        // Trigger Push Notification for new product
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await broadcastPushNotification([], {
            title: "Produk Baru Rilis! 🔥",
            body: `${name} kini tersedia di AgencyOS. Cek detail dan fiturnya sekarang!`,
            url: `${appUrl}/products/${slug}`,
        }).catch((err: any) => console.error("Auto Push Product Error:", err));

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
