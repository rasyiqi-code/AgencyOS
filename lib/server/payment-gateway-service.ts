import { prisma } from "@/lib/db";

interface MidtransConfig {
    serverKey: string;
    clientKey: string;
    merchantId: string;
    isProduction: boolean;
}

interface CreemConfig {
    apiKey: string;
    storeId: string;
    isProduction: boolean;
}

export class PaymentGatewayService {
    /**
     * Get Midtrans configuration from database, fallback to .env
     */
    async getMidtransConfig(): Promise<MidtransConfig> {
        try {
            // Try DB first
            const setting = await prisma.systemSetting.findUnique({
                where: { key: "midtrans_config" }
            });

            if (setting?.value) {
                try {
                    const config = JSON.parse(setting.value);
                    console.log("[PaymentGateway] Using Midtrans config from database");
                    return config;
                } catch (e) {
                    console.error("[PaymentGateway] Failed to parse midtrans config from DB:", e);
                }
            }
        } catch (dbError) {
            console.error("[PaymentGateway] Database error fetching midtrans config:", dbError);
        }

        // Fallback to .env
        console.log("[PaymentGateway] Using Midtrans config from .env (fallback)");
        return {
            serverKey: process.env.MIDTRANS_SERVER_KEY || "",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
            merchantId: process.env.MIDTRANS_MERCHANT_ID || "",
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true"
        };
    }

    /**
     * Get Creem configuration from database, fallback to .env
     */
    async getCreemConfig(): Promise<CreemConfig> {
        try {
            // Try DB first
            const setting = await prisma.systemSetting.findUnique({
                where: { key: "creem_config" }
            });

            if (setting?.value) {
                try {
                    const config = JSON.parse(setting.value);
                    console.log("[PaymentGateway] Using Creem config from database");
                    return config;
                } catch (e) {
                    console.error("[PaymentGateway] Failed to parse creem config from DB:", e);
                }
            }
        } catch (dbError) {
            console.error("[PaymentGateway] Database error fetching creem config:", dbError);
        }

        // Fallback to .env
        console.log("[PaymentGateway] Using Creem config from .env (fallback)");
        const apiKey = process.env.CREEM_API_KEY || "";
        return {
            apiKey,
            storeId: process.env.CREEM_STORE_ID || "",
            // Auto detect mode from API key prefix
            isProduction: apiKey ? !apiKey.startsWith("creem_test_") : false
        };
    }

    /**
     * Save Midtrans configuration to database
     */
    async saveMidtransConfig(config: MidtransConfig) {
        await prisma.systemSetting.upsert({
            where: { key: "midtrans_config" },
            update: { value: JSON.stringify(config) },
            create: { key: "midtrans_config", value: JSON.stringify(config) }
        });
        console.log("[PaymentGateway] Midtrans config saved to database");
    }

    /**
     * Save Creem configuration to database
     */
    async saveCreemConfig(config: CreemConfig) {
        await prisma.systemSetting.upsert({
            where: { key: "creem_config" },
            update: { value: JSON.stringify(config) },
            create: { key: "creem_config", value: JSON.stringify(config) }
        });
        console.log("[PaymentGateway] Creem config saved to database");
    }
}

export const paymentGatewayService = new PaymentGatewayService();
