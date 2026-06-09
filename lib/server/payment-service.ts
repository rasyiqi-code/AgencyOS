import { currencyService } from "./currency-service";
import { prisma } from "@/lib/config/db";

export class PaymentService {
    /**
     * Mengambil exchange rate USD ke IDR dengan fallback terstruktur dari database.
     */
    async getExchangeRate(): Promise<number> {
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
                        console.warn(`[PaymentService] Menggunakan rate terakhir yang diketahui dari DB currency_rates: ${rate}`);
                    }
                }
            } catch (err) {
                console.error("[PaymentService] Gagal membaca currency_rates dari DB:", err);
            }

            if (!rate) {
                // Gunakan fallback setting last_known_exchange_rate dari DB
                try {
                    const dbFallbackSetting = await prisma.systemSetting.findUnique({
                        where: { key: "last_known_exchange_rate" }
                    });
                    if (dbFallbackSetting) {
                        rate = parseFloat(dbFallbackSetting.value);
                        console.warn(`[PaymentService] Menggunakan rate fallback last_known_exchange_rate dari DB: ${rate}`);
                    }
                } catch (err) {
                    console.error("[PaymentService] Gagal membaca last_known_exchange_rate dari DB:", err);
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
                    console.warn(`[PaymentService] Menggunakan default_exchange_rate dari DB: ${defaultDbRate}`);
                }
            } catch (err) {
                console.error("[PaymentService] Gagal membaca default_exchange_rate dari DB:", err);
            }
        }

        const finalRate = rate || defaultDbRate;
        if (!rate) {
            console.warn(`[PaymentService] Exchange rate real-time dan DB fallback tidak tersedia. Menggunakan rate fallback akhir: ${finalRate}`);
        }

        return finalRate;
    }

    /**
     * Converts a USD amount to IDR using the latest cached exchange rate.
     * Returns both the IDR amount and the rate used.
     */
    async convertToIDR(usdAmount: number): Promise<{ idrAmount: number, rate: number }> {
        const rate = await this.getExchangeRate();
        const idrAmount = Math.ceil(usdAmount * rate);
        return { idrAmount, rate };
    }
}

export const paymentService = new PaymentService();
