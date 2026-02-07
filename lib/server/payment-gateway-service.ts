import { prisma } from "@/lib/config/db";

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
    async getMidtransConfig(): Promise<MidtransConfig> {
        const defaultConfig: MidtransConfig = {
            serverKey: "",
            clientKey: "",
            merchantId: "",
            isProduction: false
        };

        try {
            const setting = await prisma.systemSetting.findUnique({
                where: { key: "midtrans_config" }
            });

            if (setting?.value) {
                return JSON.parse(setting.value);
            }
        } catch (dbError) {
            console.error("[PaymentGateway] Database error fetching midtrans config:", dbError);
        }

        return defaultConfig;
    }

    /**
     * Get Creem configuration from database
     */
    async getCreemConfig(): Promise<CreemConfig> {
        const defaultConfig: CreemConfig = {
            apiKey: "",
            storeId: "",
            isProduction: false
        };

        try {
            const setting = await prisma.systemSetting.findUnique({
                where: { key: "creem_config" }
            });

            if (setting?.value) {
                return JSON.parse(setting.value);
            }
        } catch (dbError) {
            console.error("[PaymentGateway] Database error fetching creem config:", dbError);
        }

        return defaultConfig;
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

    /**
     * Check if at least one payment gateway is configured and active
     */
    async hasActiveGateway(): Promise<boolean> {
        const [midtrans, creem] = await Promise.all([
            this.getMidtransConfig(),
            this.getCreemConfig()
        ]);

        return (midtrans.serverKey !== "" && midtrans.clientKey !== "") ||
            (creem.apiKey !== "" && creem.storeId !== "");
    }
}

export const paymentGatewayService = new PaymentGatewayService();
