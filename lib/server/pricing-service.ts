import { prisma } from "@/lib/config/db";
import { getSystemSettings } from "@/lib/server/settings";

export interface PricingConfig {
    baseRate: number;
    multipliers: {
        Low: number;
        Medium: number;
        High: number;
    };
}

const CONFIG_KEY = "pricing_config";

export class PricingService {
    async getConfig(): Promise<PricingConfig> {
        // OPTIMASI M5: Ambil konfigurasi dalam satu kueri baris tunggal berbasis JSON untuk menghemat resource
        const settings = await getSystemSettings([CONFIG_KEY]);
        const configSetting = settings.find((x: { key: string; value: string }) => x.key === CONFIG_KEY);

        if (configSetting) {
            try {
                return JSON.parse(configSetting.value) as PricingConfig;
            } catch {
                // Abaikan parsing error, fallback ke default
            }
        }

        return {
            baseRate: 15,
            multipliers: {
                Low: 1.0,
                Medium: 1.25,
                High: 1.5
            }
        };
    }

    async saveConfig(config: PricingConfig) {
        // Simpan seluruh konfigurasi sebagai JSON string dalam satu operasi upsert tunggal untuk efisiensi kueri
        await prisma.systemSetting.upsert({
            where: { key: CONFIG_KEY },
            update: { value: JSON.stringify(config) },
            create: { key: CONFIG_KEY, value: JSON.stringify(config) }
        });
    }
}

export const pricingService = new PricingService();
