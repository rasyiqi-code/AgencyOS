import { NextRequest, NextResponse } from "next/server";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const scope = searchParams.get("scope") || "user";
        const type = searchParams.get("type") || undefined;

        // 1. PUBLIC SCOPE (No auth check, limited fields, CORS headers)
        if (scope === "public") {
            const assets = await prisma.marketingAsset.findMany({
                where: {
                    isActive: true,
                    type: type || 'banner_widget'
                },
                select: {
                    id: true,
                    title: true,
                    content: true, // Target URL
                    imageUrl: true,
                    category: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return NextResponse.json(assets, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }

        // Auth check untuk user & admin scope
        const user = await hexclaveServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. ADMIN SCOPE (Admin check + Pagination)
        if (scope === "admin") {
            const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
            const superAdminId = process.env.SUPER_ADMIN_ID;
            const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

            if (!isSuperAdmin) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 100);
            const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
            const skip = (page - 1) * limit;

            const assets = await prisma.marketingAsset.findMany({
                where: type ? { type } : undefined,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip,
            });

            return NextResponse.json(assets);
        }

        // 3. USER SCOPE (Affiliate / User check)
        const userIsAdmin = await isAdmin();
        const affiliate = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
        });
        const isAffiliate = affiliate && affiliate.status === "approved";

        if (!userIsAdmin && !isAffiliate) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const assets = await prisma.marketingAsset.findMany({
            where: {
                isActive: true,
                type: type || undefined
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Marketing Assets GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await hexclaveServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { type, title, content, imageUrl, category, metadata } = body;

        const asset = await prisma.marketingAsset.create({
            data: {
                type,
                title,
                content,
                imageUrl,
                category,
                metadata
            }
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Create Marketing Asset Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}
