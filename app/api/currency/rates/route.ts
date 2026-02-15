import { NextResponse } from "next/server";
import { currencyService } from "@/lib/server/currency-service";

export const dynamic = "force-dynamic";

export async function GET() {
    const rates = await currencyService.getRates();

    // Fallback if service fails completely
    if (!rates) {
        return NextResponse.json({
            base: "USD",
            rates: { IDR: 16000 },
            lastUpdated: 0
        });
    }

    return NextResponse.json(rates);
}
