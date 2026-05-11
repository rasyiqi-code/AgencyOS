import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { SystemSetting } from "@prisma/client";
import { cache } from "react";

/**
 * Memfetche semua setting sekaligus dan menyimpannya dalam Request Memoization (React cache).
 * Ini memastikan hanya ada SATU kueri ke database per satu kali render halaman, 
 * berapapun jumlah komponen yang memanggilnya.
 */
const getAllSettingsCached = cache(async () => {
    return unstable_cache(
        async () => {
            try {
                return await prisma.systemSetting.findMany();
            } catch (error) {
                console.error("[Settings] DB Fetch Error:", error);
                return [];
            }
        },
        ["all-system-settings-singleton"],
        {
            tags: ["system-settings"],
            revalidate: 3600, // Cache global selama 1 jam
        }
    )();
});

/**
 * Mengambil pengaturan sistem dengan dukungan caching Next.js.
 * @param keys Array kunci pengaturan yang ingin diambil.
 * @returns Array objek pengaturan.
 */
export const getSystemSettings = async (keys: string[]): Promise<SystemSetting[]> => {
    const allSettings = await getAllSettingsCached();
    
    // Filter hanya kunci yang diminta dari cache singleton
    return allSettings.filter(s => keys.includes(s.key));
};

/**
 * Helper untuk mengambil nilai tunggal atau ganti dengan default.
 * Digunakan secara luas di berbagai komponen.
 */
export async function getSettingValue(key: string, defaultValue: string = ""): Promise<string> {
    const settings = await getSystemSettings([key]);
    const setting = settings.find((s) => s.key === key);
    return setting?.value || defaultValue;
}
