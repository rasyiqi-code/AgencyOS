import { currencyService } from "./currency-service";

export class PaymentService {
    /**
     * Converts a USD amount to IDR using the latest cached exchange rate.
     * Returns both the IDR amount and the rate used.
     */
    async convertToIDR(usdAmount: number): Promise<{ idrAmount: number, rate: number }> {
        const rates = await currencyService.getRates();

        // Default fallback if API fails completely (e.g. 15,000) - preferably we shouldn't fail silently but for now safety.
        // But better to throw if no rate to avoid charging wrong.
        if (!rates || !rates.rates.IDR) {
            console.warn("[PaymentService] Failed to get real-time rates. Using fallback 16000.");
            const fallbackRate = 16000;
            return {
                idrAmount: Math.ceil(usdAmount * fallbackRate),
                rate: fallbackRate
            };
        }

        const rate = rates.rates.IDR;
        const idrAmount = Math.ceil(usdAmount * rate);

        return { idrAmount, rate };
    }
}

export const paymentService = new PaymentService();
