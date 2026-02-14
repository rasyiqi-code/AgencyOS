
import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Admin check
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) return new NextResponse("Forbidden", { status: 403 });

        const assets = await prisma.marketingAsset.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Admin Marketing Assets Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Admin check
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) return new NextResponse("Forbidden", { status: 403 });

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
        return new NextResponse("Internal Error", { status: 500 });
    }
}
