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
        const MAX_RETRIES = 2;
        const TIMEOUT_MS = 5000; // 5 seconds timeout

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[CurrencyService] Fetching rates (attempt ${attempt}/${MAX_RETRIES})...`);

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

                const response = await fetch(
                    `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=IDR`,
                    { signal: controller.signal }
                );

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API returned ${response.status}: ${errorText}`);
                }

                const data = await response.json();

                // Validate response structure
                if (!data.rates || !data.rates.IDR) {
                    throw new Error("Invalid API response structure");
                }

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

                console.log(`[CurrencyService] Rates updated successfully: 1 USD = ${newRates.rates.IDR} IDR`);
                return newRates;

            } catch (error) {
                const isLastAttempt = attempt === MAX_RETRIES;
                const errorMessage = error instanceof Error ? error.message : String(error);

                if (error instanceof Error && error.name === 'AbortError') {
                    console.warn(`[CurrencyService] Request timeout after ${TIMEOUT_MS}ms (attempt ${attempt}/${MAX_RETRIES})`);
                } else {
                    console.error(`[CurrencyService] Error fetching rates (attempt ${attempt}/${MAX_RETRIES}):`, errorMessage);
                }

                if (isLastAttempt) {
                    // Return cached rates if available
                    const cachedSetting = await prisma.systemSetting.findUnique({
                        where: { key: RATES_KEY }
                    });

                    if (cachedSetting) {
                        try {
                            const cached = JSON.parse(cachedSetting.value);
                            console.warn("[CurrencyService] Using stale cached rates due to API failure");
                            return cached;
                        } catch {
                            // Cached data is corrupted
                        }
                    }

                    console.error("[CurrencyService] All retry attempts failed and no cached rates available");
                    return null;
                }

                // Wait before retry (exponential backoff: 1s, 2s)
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
        }

        return null;
    }

}

export const currencyService = new CurrencyService();
