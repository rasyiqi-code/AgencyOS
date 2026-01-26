import { prisma } from "@/lib/db";

const CONFIG_KEY = "currency_config";
const RATES_KEY = "currency_rates";

interface CurrencyConfig {
    apiKey: string;
    intervalHours: number;
}

interface ExchangeRates {
    base: string;
    rates: Record<string, number>;
    lastUpdated: number;
}

export class CurrencyService {
    async getConfig(): Promise<CurrencyConfig | null> {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: CONFIG_KEY }
        });
        if (!setting) return null;
        try {
            return JSON.parse(setting.value);
        } catch {
            return null;
        }
    }

    async saveConfig(apiKey: string, intervalHours: number) {
        await prisma.systemSetting.upsert({
            where: { key: CONFIG_KEY },
            update: { value: JSON.stringify({ apiKey, intervalHours }) },
            create: { key: CONFIG_KEY, value: JSON.stringify({ apiKey, intervalHours }) }
        });
    }

    async getRates(): Promise<ExchangeRates | null> {
        // 1. Try to get cached rates
        const setting = await prisma.systemSetting.findUnique({
            where: { key: RATES_KEY }
        });

        let cached: ExchangeRates | null = null;
        if (setting) {
            try {
                cached = JSON.parse(setting.value);
            } catch { /* ignore */ }
        }

        const config = await this.getConfig();
        if (!config || !config.apiKey) {
            // If no config, return cached or default fallback if absolutely needed (but here we just return null/cached)
            return cached;
        }

        // 2. Check if update needed
        const now = Date.now();
        const intervalMs = (config.intervalHours || 24) * 60 * 60 * 1000;

        if (!cached || (now - cached.lastUpdated > intervalMs)) {
            console.log("[CurrencyService] Cache expired or missing, fetching new rates...");
            return await this.fetchAndCacheRates(config.apiKey);
        }

        return cached;
    }

    async fetchAndCacheRates(apiKey: string): Promise<ExchangeRates | null> {
        try {
            // CurrencyFreaks API
            // https://api.currencyfreaks.com/v2.0/rates/latest?apikey=APIKEY&symbols=IDR
            const response = await fetch(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=IDR`);
            if (!response.ok) throw new Error("Failed to fetch rates");

            const data = await response.json();

            // Format: { date: "...", base: "USD", rates: { "IDR": "16000.50" } }
            // Note: Rates are strings in response
            const newRates: ExchangeRates = {
                base: data.base || "USD",
                rates: {
                    IDR: parseFloat(data.rates.IDR)
                },
                lastUpdated: Date.now()
            };

            await prisma.systemSetting.upsert({
                where: { key: RATES_KEY },
                update: { value: JSON.stringify(newRates) },
                create: { key: RATES_KEY, value: JSON.stringify(newRates) }
            });

            console.log("[CurrencyService] Rates updated successfully");
            return newRates;

        } catch (error) {
            console.error("[CurrencyService] Error fetching rates:", error);
            return null;
        }
    }
}

export const currencyService = new CurrencyService();
