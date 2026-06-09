import { currencyService } from "./currency-service";
import { prisma } from "@/lib/config/db";

export class PaymentService {
    /**
     * Converts a USD amount to IDR using the latest cached exchange rate.
     * Returns both the IDR amount and the rate used.
     */
    async convertToIDR(usdAmount: number): Promise<{ idrAmount: number, rate: number }> {
        const rates = await currencyService.getRates();
        let rate: number | null = null;

        if (rates && rates.rates && rates.rates.IDR) {
            rate = rates.rates.IDR;
        } else {
            // Ambil langsung dari database rates key tanpa filter cache
            try {
                const dbRateSetting = await prisma.systemSetting.findUnique({
                    where: { key: "currency_rates" }
                });
                if (dbRateSetting) {
                    const parsed = JSON.parse(dbRateSetting.value);
                    if (parsed && parsed.rates && parsed.rates.IDR) {
                        rate = Number(parsed.rates.IDR);
                        console.warn(`[PaymentService] Using last known rate from DB currency_rates: ${rate}`);
                    }
                }
            } catch (err) {
                console.error("[PaymentService] Failed to read currency_rates from DB:", err);
            }

            if (!rate) {
                // Gunakan fallback setting last_known_exchange_rate dari DB
                try {
                    const dbFallbackSetting = await prisma.systemSetting.findUnique({
                        where: { key: "last_known_exchange_rate" }
                    });
                    if (dbFallbackSetting) {
                        rate = parseFloat(dbFallbackSetting.value);
                        console.warn(`[PaymentService] Using fallback setting last_known_exchange_rate from DB: ${rate}`);
                    }
                } catch (err) {
                    console.error("[PaymentService] Failed to read last_known_exchange_rate from DB:", err);
                }
            }
        }

        let defaultDbRate = 15000;
        if (!rate) {
            try {
                const dbDefaultSetting = await prisma.systemSetting.findUnique({
                    where: { key: "default_exchange_rate" }
                });
                if (dbDefaultSetting) {
                    defaultDbRate = parseFloat(dbDefaultSetting.value) || 15000;
                    console.warn(`[PaymentService] Using default_exchange_rate from DB: ${defaultDbRate}`);
                }
            } catch (err) {
                console.error("[PaymentService] Failed to read default_exchange_rate from DB:", err);
            }
        }

        const finalRate = rate || defaultDbRate;
        if (!rate) {
            console.warn(`[PaymentService] Real-time rates and DB fallbacks unavailable. Using final fallback rate: ${finalRate}`);
        }

        const idrAmount = Math.ceil(usdAmount * finalRate);
        return { idrAmount, rate: finalRate };
    }
}

export const paymentService = new PaymentService();
