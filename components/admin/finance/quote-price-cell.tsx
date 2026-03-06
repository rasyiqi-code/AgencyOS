"use client";

import { PriceDisplay } from "@/components/providers/currency-provider";

/**
 * Client component untuk menampilkan harga di tabel quotes
 * dengan dukungan currency switching (IDR/USD) via PriceDisplay.
 */
export function QuotePriceCell({ amount, baseCurrency }: {
    amount: number;
    baseCurrency: "USD" | "IDR";
}) {
    return <PriceDisplay amount={amount} baseCurrency={baseCurrency} />;
}
