
import { NextResponse } from "next/server";
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


