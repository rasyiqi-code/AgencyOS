import { prisma } from "@/lib/config/db";
import { safeUnstableCache as unstable_cache } from "@/lib/shared/cache";
import { cache } from "react";

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
    /**
     * Mengambil konfigurasi currency dengan memoization.
     */
    getConfig = cache(async (): Promise<CurrencyConfig | null> => {
        return unstable_cache(
            async () => {
                const setting = await prisma.systemSetting.findUnique({
                    where: { key: CONFIG_KEY }
                });
                if (!setting) return null;
                try {
                    return JSON.parse(setting.value) as CurrencyConfig;
                } catch {
                    return null;
                }
            },
            ["currency-config-singleton"],
            { revalidate: 3600, tags: ["currency"] }
        )();
    });

    /**
     * Menyimpan konfigurasi currency.
     */
    async saveConfig(apiKey: string, intervalHours: number) {
        await prisma.systemSetting.upsert({
            where: { key: CONFIG_KEY },
            update: { value: JSON.stringify({ apiKey, intervalHours }) },
            create: { key: CONFIG_KEY, value: JSON.stringify({ apiKey, intervalHours }) }
        });
    }

    /**
     * Mengambil exchange rates dengan memoization dan background refreshing.
     */
    getRates = cache(async (): Promise<ExchangeRates | null> => {
        // 1. Try to get cached rates from DB (now with Next.js caching)
        const getCachedRates = unstable_cache(
            async () => {
                const setting = await prisma.systemSetting.findUnique({
                    where: { key: RATES_KEY }
                });
                if (setting) {
                    try {
                        return JSON.parse(setting.value) as ExchangeRates;
                    } catch { /* ignore */ }
                }
                return null;
            },
            ["currency-rates-db-singleton"],
            { revalidate: 3600, tags: ["currency"] }
        );

        const cached = await getCachedRates();
        const config = await this.getConfig();
        
        if (!config || !config.apiKey) {
            return cached;
        }

        // 2. Check if update needed from API
        const now = Date.now();
        const intervalMs = (config.intervalHours || 24) * 60 * 60 * 1000;

        if (!cached || (now - cached.lastUpdated > intervalMs)) {
            // Note: In a real high-traffic app, we might want to trigger this 
            // in the background without blocking the current request.
            // For now, we fetch if expired.
            return await this.fetchAndCacheRates(config.apiKey);
        }

        return cached;
    });

    async fetchAndCacheRates(apiKey: string): Promise<ExchangeRates | null> {
        const isTest = process.env.NODE_ENV === 'test';
        const MAX_RETRIES = isTest ? 2 : 1; // Gunakan 2 untuk test, dan 1 untuk production guna mencegah timeout 504
        const TIMEOUT_MS = 2000; // 2 detik timeout agar lebih cepat mem-fallback ke cache lokal

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
