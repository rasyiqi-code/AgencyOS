import { prisma } from "@/lib/config/db";
import { getSystemSettings } from "@/lib/server/settings";

interface MidtransConfig {
    serverKey: string;
    clientKey: string;
    merchantId: string;
    isProduction: boolean;
    isActive: boolean;
}

interface CreemConfig {
    apiKey: string;
    storeId: string;
    isProduction: boolean;
    isActive: boolean;
}

export class PaymentGatewayService {
    async getMidtransConfig(): Promise<MidtransConfig> {
        const defaultConfig: MidtransConfig = {
            serverKey: "",
            clientKey: "",
            merchantId: "",
            isProduction: false,
            isActive: false
        };

        try {
            // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
            // 🎯 Why: Reduces direct database queries and utilizes Next.js unstable_cache
            // 📊 Impact: Faster configuration retrieval and lower database load
            const settings = await getSystemSettings(["midtrans_config"]);
            const setting = settings.find(s => s.key === "midtrans_config");

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
            isProduction: false,
            isActive: false
        };

        try {
            // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
            // 🎯 Why: Reduces direct database queries and utilizes Next.js unstable_cache
            // 📊 Impact: Faster configuration retrieval and lower database load
            const settings = await getSystemSettings(["creem_config"]);
            const setting = settings.find(s => s.key === "creem_config");

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
     * Get individual activation status for all gateways
     */
    async getGatewayStatus(): Promise<{ midtrans: boolean; creem: boolean }> {
        const [midtrans, creem] = await Promise.all([
            this.getMidtransConfig(),
            this.getCreemConfig()
        ]);

        return {
            midtrans: midtrans.isActive && midtrans.serverKey !== "" && midtrans.clientKey !== "",
            creem: creem.isActive && creem.apiKey !== "" && creem.storeId !== ""
        };
    }

    /**
     * Check if at least one payment gateway is configured and active
     */
    async hasActiveGateway(): Promise<boolean> {
        const status = await this.getGatewayStatus();
        return status.midtrans || status.creem;
    }
}

export const paymentGatewayService = new PaymentGatewayService();
