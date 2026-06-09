
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const user = await hexclaveServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Admin check
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) return new NextResponse("Forbidden", { status: 403 });

        // Ambil parameter pagination dari query string untuk membatasi query database
        const url = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10), 1), 100);
        const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
        const skip = (page - 1) * limit;

        const assets = await prisma.marketingAsset.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Admin Marketing Assets Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await hexclaveServerApp.getUser();
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
