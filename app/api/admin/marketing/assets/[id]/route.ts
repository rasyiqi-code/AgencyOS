
import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await stackServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Admin check
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) return new NextResponse("Forbidden", { status: 403 });

        const body = await req.json();
        const { title, content, imageUrl, category, isActive, metadata } = body;

        const asset = await prisma.marketingAsset.update({
            where: { id },
            data: {
                title,
                content,
                imageUrl,
                category,
                isActive,
                metadata
            }
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Update Marketing Asset Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await stackServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Admin check
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) return new NextResponse("Forbidden", { status: 403 });

        await prisma.marketingAsset.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Delete Marketing Asset Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
