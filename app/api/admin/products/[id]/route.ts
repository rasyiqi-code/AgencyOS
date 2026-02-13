import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+ params is async, assuming 14 or lower based on package.json, but treating safely. Actually package.json showed "next": "16.1.4" which is very new? Wait, likely 14 or 15. Standard is await params in newer versions.
) {
    try {
        const { id } = await params;
        if (!id) {
            return new NextResponse("Product ID required", { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { licenses: true },
                },
            },
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, slug, description, price, type, isActive, purchaseType, interval, image, fileUrl } = body;

        if (!id) {
            return new NextResponse("Product ID required", { status: 400 });
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                price,
                type,
                isActive,
                purchaseType,
                interval,
                image,
                fileUrl,
            } as any,
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return new NextResponse("Product ID required", { status: 400 });
        }

        const product = await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
