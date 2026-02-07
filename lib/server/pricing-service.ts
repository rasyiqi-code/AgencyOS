import { prisma } from "@/lib/config/db";

export interface PricingConfig {
    baseRate: number;
    multipliers: {
        Low: number;
        Medium: number;
        High: number;
    };
}

const KEYS = {
    BASE_RATE: "pricing_base_rate",
    MULT_LOW: "pricing_multiplier_low",
    MULT_MED: "pricing_multiplier_medium",
    MULT_HIGH: "pricing_multiplier_high"
};

export class PricingService {
    async getConfig(): Promise<PricingConfig> {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: Object.values(KEYS) }
            }
        });

        const getVal = (key: string, def: number) => {
            const s = settings.find(x => x.key === key);
            return s ? parseFloat(s.value) : def;
        };

        return {
            baseRate: getVal(KEYS.BASE_RATE, 15),
            multipliers: {
                Low: getVal(KEYS.MULT_LOW, 1.0),
                Medium: getVal(KEYS.MULT_MED, 1.25),
                High: getVal(KEYS.MULT_HIGH, 1.5)
            }
        };
    }

    async saveConfig(config: PricingConfig) {
        const ops = [
            prisma.systemSetting.upsert({ where: { key: KEYS.BASE_RATE }, update: { value: config.baseRate.toString() }, create: { key: KEYS.BASE_RATE, value: config.baseRate.toString() } }),
            prisma.systemSetting.upsert({ where: { key: KEYS.MULT_LOW }, update: { value: config.multipliers.Low.toString() }, create: { key: KEYS.MULT_LOW, value: config.multipliers.Low.toString() } }),
            prisma.systemSetting.upsert({ where: { key: KEYS.MULT_MED }, update: { value: config.multipliers.Medium.toString() }, create: { key: KEYS.MULT_MED, value: config.multipliers.Medium.toString() } }),
            prisma.systemSetting.upsert({ where: { key: KEYS.MULT_HIGH }, update: { value: config.multipliers.High.toString() }, create: { key: KEYS.MULT_HIGH, value: config.multipliers.High.toString() } }),
        ];
        await prisma.$transaction(ops);
    }
}

export const pricingService = new PricingService();
