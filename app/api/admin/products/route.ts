import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";

export async function GET() {
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
    try {
        const body = await req.json();
        const { name, slug, description, price, type, isActive, purchaseType, interval, image, fileUrl } = body;

        if (!name || !slug) { // Removed price check or check it properly
            // Price 0 is allowed for free products
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
            } as any,
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
