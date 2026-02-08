import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

/**
 * Mengambil pengaturan sistem dengan dukungan caching Next.js.
 * @param keys Array kunci pengaturan yang ingin diambil.
 * @returns Map objek pengaturan.
 */
export const getSystemSettings = unstable_cache(
    async (keys: string[]) => {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: keys }
            }
        });
        return settings;
    },
    ["system-settings"],
    {
        tags: ["system-settings"],
        revalidate: 3600,
    }
);

/**
 * Helper untuk mengambil nilai tunggal atau ganti dengan default.
 */
export async function getSettingValue(key: string, defaultValue: string = ""): Promise<string> {
    const settings = await getSystemSettings([key]);
    return settings.find(s => s.key === key)?.value || defaultValue;
}
