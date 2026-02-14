import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { randomBytes } from "crypto";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET(req: Request) {
    // Auth check: hanya admin yang boleh melihat semua license
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        const where = productId ? { productId } : {};

        const licenses = await prisma.license.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: { name: true, slug: true }
                }
            }
        });

        return NextResponse.json(licenses);
    } catch (error) {
        console.error("[LICENSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    // Auth check: hanya admin yang boleh membuat license baru
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { productId, maxActivations, expiresAt, status, userId, metadata } = body;

        if (!productId) {
            return new NextResponse("Product ID required", { status: 400 });
        }

        // Generate a unique key
        // Format: KEY-XXXX-XXXX-XXXX
        const key = `KEY-${randomBytes(6).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-')}`;

        const license = await prisma.license.create({
            data: {
                key,
                productId,
                maxActivations: maxActivations || 1,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                status: status || 'active',
                userId,
                metadata
            },
        });

        return NextResponse.json(license);
    } catch (error) {
        console.error("[LICENSES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
