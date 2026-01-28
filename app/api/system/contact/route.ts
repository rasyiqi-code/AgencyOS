
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { revalidatePath } from "next/cache";

const CONTACT_EMAIL_KEY = "CONTACT_EMAIL";
const CONTACT_PHONE_KEY = "CONTACT_PHONE";
const CONTACT_ADDRESS_KEY = "CONTACT_ADDRESS";
const LOGO_URL_KEY = "LOGO_URL";

export async function GET() {
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: [CONTACT_EMAIL_KEY, CONTACT_PHONE_KEY, CONTACT_ADDRESS_KEY, LOGO_URL_KEY] }
        }
    });

    const getVal = (key: string) => settings.find(s => s.key === key)?.value || null;

    return NextResponse.json({
        email: getVal(CONTACT_EMAIL_KEY),
        phone: getVal(CONTACT_PHONE_KEY),
        address: getVal(CONTACT_ADDRESS_KEY),
        logoUrl: getVal(LOGO_URL_KEY)
    });
}

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { email, phone, address, logoUrl } = body;

        const updates = [
            prisma.systemSetting.upsert({
                where: { key: CONTACT_EMAIL_KEY },
                update: { value: email || "", description: "Public contact email" },
                create: { key: CONTACT_EMAIL_KEY, value: email || "", description: "Public contact email" }
            }),
            prisma.systemSetting.upsert({
                where: { key: CONTACT_PHONE_KEY },
                update: { value: phone || "", description: "Public contact phone" },
                create: { key: CONTACT_PHONE_KEY, value: phone || "", description: "Public contact phone" }
            }),
            prisma.systemSetting.upsert({
                where: { key: CONTACT_ADDRESS_KEY },
                update: { value: address || "", description: "Public office address" },
                create: { key: CONTACT_ADDRESS_KEY, value: address || "", description: "Public office address" }
            }),
            prisma.systemSetting.upsert({
                where: { key: LOGO_URL_KEY },
                update: { value: logoUrl || "", description: "System logo URL" },
                create: { key: LOGO_URL_KEY, value: logoUrl || "", description: "System logo URL" }
            })
        ];

        await prisma.$transaction(updates);

        revalidatePath("/admin/system/settings");
        revalidatePath("/", "layout");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("System Contact API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
