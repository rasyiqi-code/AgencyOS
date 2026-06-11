import { NextResponse } from "next/server";
import { isAIConfigured } from "@/app/genkit/ai";
import { getSystemSettings } from "@/lib/server/settings";

const CONTACT_PHONE_KEY = "CONTACT_PHONE";
const CONTACT_TELEGRAM_KEY = "CONTACT_TELEGRAM";

export async function GET() {
    // Mengecek status konfigurasi AI dan mengambil pengaturan kontak secara paralel
    const [configured, settings] = await Promise.all([
        isAIConfigured(),
        getSystemSettings([CONTACT_PHONE_KEY, CONTACT_TELEGRAM_KEY])
    ]);

    const getVal = (key: string) => settings.find(s => s.key === key)?.value || null;

    return NextResponse.json({
        configured,
        contact: {
            phone: getVal(CONTACT_PHONE_KEY),
            telegram: getVal(CONTACT_TELEGRAM_KEY)
        }
    });
}
