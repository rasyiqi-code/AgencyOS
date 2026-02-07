import { NextRequest, NextResponse } from "next/server";
import { currencyService } from "@/lib/server/currency-service";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        const { apiKey, intervalHours, action } = body;

        if (action === "force_update") {
            const config = await currencyService.getConfig();
            if (!config?.apiKey) {
                return NextResponse.json({ message: "API Key not configured" }, { status: 400 });
            }
            const rates = await currencyService.fetchAndCacheRates(config.apiKey);
            return NextResponse.json(rates);
        }

        // Save Config
        if (!apiKey) {
            return NextResponse.json({ message: "API Key required" }, { status: 400 });
        }

        await currencyService.saveConfig(apiKey, Number(intervalHours) || 24);
        return NextResponse.json({ message: "Configuration saved" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const config = await currencyService.getConfig();
    const rates = await currencyService.getRates(); // Will fetch if expired, but here we probably just want status
    // Actually getRates() does fetch if expired.

    // Check purely database state for UI display (don't auto fetch on admin view unless needed)
    // But getRates() is safe.

    return NextResponse.json({
        config: config || { apiKey: "", intervalHours: 24 },
        rates
    });
}
