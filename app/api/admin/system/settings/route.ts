
import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Admin check: cek ADMIN_EMAILS dan SUPER_ADMIN_ID
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const settings = await prisma.systemSetting.findMany();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ settings: settingsMap });

    } catch (error) {
        console.error("Get Settings Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { key, value } = body;

        await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update Setting Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
