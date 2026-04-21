
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSystemSettings } from "@/lib/server/settings";

const CONTACT_EMAIL_KEY = "CONTACT_EMAIL";
const CONTACT_PHONE_KEY = "CONTACT_PHONE";
const CONTACT_TELEGRAM_KEY = "CONTACT_TELEGRAM";
const CONTACT_ADDRESS_KEY = "CONTACT_ADDRESS";
const AGENCY_NAME_KEY = "AGENCY_NAME";
const COMPANY_NAME_KEY = "COMPANY_NAME";
const AGENCY_LOGO_KEY = "AGENCY_LOGO";
const AGENCY_LOGO_DISPLAY_KEY = "AGENCY_LOGO_DISPLAY";
const SERVICES_TITLE_KEY = "SERVICES_TITLE";
const SERVICES_SUBTITLE_KEY = "SERVICES_SUBTITLE";
const CONTACT_HOURS_KEY = "CONTACT_HOURS";

export async function GET() {
    // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
    // 🎯 Why: Reduces redundant database queries for global settings, mitigating N+1 query problems and reducing database load.
    // 📊 Impact: Faster API response times and less database load by leveraging Next.js caching.
    const settings = await getSystemSettings([CONTACT_EMAIL_KEY, CONTACT_PHONE_KEY, CONTACT_TELEGRAM_KEY, CONTACT_ADDRESS_KEY, AGENCY_NAME_KEY, COMPANY_NAME_KEY, AGENCY_LOGO_KEY, AGENCY_LOGO_DISPLAY_KEY, SERVICES_TITLE_KEY, SERVICES_SUBTITLE_KEY, CONTACT_HOURS_KEY]);

    const getVal = (key: string) => settings.find(s => s.key === key)?.value || null;

    return NextResponse.json({
        email: getVal(CONTACT_EMAIL_KEY),
        phone: getVal(CONTACT_PHONE_KEY),
        telegram: getVal(CONTACT_TELEGRAM_KEY),
        address: getVal(CONTACT_ADDRESS_KEY),
        agencyName: getVal(AGENCY_NAME_KEY),
        companyName: getVal(COMPANY_NAME_KEY),
        logoUrl: getVal(AGENCY_LOGO_KEY),
        logoDisplayMode: getVal(AGENCY_LOGO_DISPLAY_KEY),
        servicesTitle: getVal(SERVICES_TITLE_KEY),
        servicesSubtitle: getVal(SERVICES_SUBTITLE_KEY),
        hours: getVal(CONTACT_HOURS_KEY),
    });
}

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { email, phone, telegram, address, agencyName, companyName, logoUrl, logoDisplayMode, servicesTitle, servicesSubtitle, hours } = body;

        const updates = [
            prisma.systemSetting.upsert({
                where: { key: CONTACT_EMAIL_KEY },
                update: { value: email || "", description: "Public Contact Email" },
                create: { key: CONTACT_EMAIL_KEY, value: email || "", description: "Public Contact Email" }
            }),
            prisma.systemSetting.upsert({
                where: { key: CONTACT_PHONE_KEY },
                update: { value: phone || "", description: "Public Phone Number (WhatsApp)" },
                create: { key: CONTACT_PHONE_KEY, value: phone || "", description: "Public Phone Number (WhatsApp)" }
            }),
            prisma.systemSetting.upsert({
                where: { key: CONTACT_TELEGRAM_KEY },
                update: { value: telegram || "", description: "Telegram Handle" },
                create: { key: CONTACT_TELEGRAM_KEY, value: telegram || "", description: "Telegram Handle" }
            }),
            prisma.systemSetting.upsert({
                where: { key: CONTACT_ADDRESS_KEY },
                update: { value: address || "", description: "Office Address" },
                create: { key: CONTACT_ADDRESS_KEY, value: address || "", description: "Office Address" }
            }),
            prisma.systemSetting.upsert({
                where: { key: AGENCY_NAME_KEY },
                update: { value: agencyName || "", description: "Brand Name" },
                create: { key: AGENCY_NAME_KEY, value: agencyName || "", description: "Brand Name" }
            }),
            prisma.systemSetting.upsert({
                where: { key: COMPANY_NAME_KEY },
                update: { value: companyName || "", description: "Legal Company Name" },
                create: { key: COMPANY_NAME_KEY, value: companyName || "", description: "Legal Company Name" }
            }),
            prisma.systemSetting.upsert({
                where: { key: AGENCY_LOGO_KEY },
                update: { value: logoUrl || "", description: "Agency Logo URL" },
                create: { key: AGENCY_LOGO_KEY, value: logoUrl || "", description: "Agency Logo URL" }
            }),
            prisma.systemSetting.upsert({
                where: { key: AGENCY_LOGO_DISPLAY_KEY },
                update: { value: logoDisplayMode || "both", description: "Logo Display Mode" },
                create: { key: AGENCY_LOGO_DISPLAY_KEY, value: logoDisplayMode || "both", description: "Logo Display Mode" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SERVICES_TITLE_KEY },
                update: { value: servicesTitle || "", description: "Services Page Title" },
                create: { key: SERVICES_TITLE_KEY, value: servicesTitle || "", description: "Services Page Title" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SERVICES_SUBTITLE_KEY },
                update: { value: servicesSubtitle || "", description: "Services Page Subtitle" },
                create: { key: SERVICES_SUBTITLE_KEY, value: servicesSubtitle || "", description: "Services Page Subtitle" }
            }),
            prisma.systemSetting.upsert({
                where: { key: CONTACT_HOURS_KEY },
                update: { value: hours || "", description: "Business Hours" },
                create: { key: CONTACT_HOURS_KEY, value: hours || "", description: "Business Hours" }
            }),
        ];

        await prisma.$transaction(updates);

        revalidatePath("/admin/system/settings", "page");
        revalidatePath("/", "layout");
        revalidateTag("system-settings", "updateTag");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("System Contact API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
