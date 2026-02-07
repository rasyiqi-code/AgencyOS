
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

const RESEND_KEY_DB_KEY = "RESEND_API_KEY";
const ADMIN_EMAIL_DB_KEY = "ADMIN_EMAIL_TARGET";

export async function GET() {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: [RESEND_KEY_DB_KEY, ADMIN_EMAIL_DB_KEY] }
        }
    });

    const getVal = (key: string) => settings.find(s => s.key === key)?.value || null;

    return NextResponse.json({
        resendKey: getVal(RESEND_KEY_DB_KEY),
        adminEmail: getVal(ADMIN_EMAIL_DB_KEY)
    });
}

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { resendKey, adminEmail } = body;

        if (resendKey !== undefined) {
            await prisma.systemSetting.upsert({
                where: { key: RESEND_KEY_DB_KEY },
                update: { value: resendKey, description: "API Key for Resend email service" },
                create: { key: RESEND_KEY_DB_KEY, value: resendKey, description: "API Key for Resend email service" }
            });
        }

        if (adminEmail !== undefined) {
            await prisma.systemSetting.upsert({
                where: { key: ADMIN_EMAIL_DB_KEY },
                update: { value: adminEmail, description: "Target email address for contact form submissions" },
                create: { key: ADMIN_EMAIL_DB_KEY, value: adminEmail, description: "Target email address for contact form submissions" }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("System Email API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
