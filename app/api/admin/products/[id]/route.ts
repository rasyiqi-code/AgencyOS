import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+ params is async, assuming 14 or lower based on package.json, but treating safely. Actually package.json showed "next": "16.1.4" which is very new? Wait, likely 14 or 15. Standard is await params in newer versions.
) {
    // Auth check: hanya admin yang boleh mengakses detail produk via admin route
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    // Auth check: hanya admin yang boleh mengupdate produk
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { name, slug, description, price, type, isActive, purchaseType, interval, image, fileUrl, name_id, description_id } = body;

        if (!id) {
            return new NextResponse("Product ID required", { status: 400 });
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                price: price !== undefined ? Number(price) || 0 : undefined,
                type,
                isActive,
                purchaseType,
                interval,
                image,
                fileUrl,
                name_id,
                description_id,
            }
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
    // Auth check: hanya admin yang boleh menghapus produk
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        // Check for dependencies (licenses or orders)
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        licenses: true,
                        digitalOrders: true,
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (product._count.licenses > 0 || product._count.digitalOrders > 0) {
            return NextResponse.json({
                error: `Cannot delete product. It has ${product._count.licenses} licenses and ${product._count.digitalOrders} orders associated with it.`
            }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PRODUCT_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
