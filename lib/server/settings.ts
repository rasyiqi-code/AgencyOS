import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { SystemSetting } from "@prisma/client";

// Track in-flight requests to prevent "Parallel Overload" (Stampede)
// Multiple components calling getSystemSettings at once will share the same promise.
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Mengambil pengaturan sistem dengan dukungan caching Next.js.
 * @param keys Array kunci pengaturan yang ingin diambil.
 * @returns Map objek pengaturan.
 */
export const getSystemSettings = async (keys: string[]) => {
    // Sort keys for a consistent cache key
    const sortedKeys = [...keys].sort();
    const cacheKey = sortedKeys.join(",");

    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey)!;
    }

    const request = (async () => {
        return unstable_cache(
            async (keysToFetch: string[]) => {
                try {
                    const settings = await prisma.systemSetting.findMany({
                        where: {
                            key: { in: keysToFetch }
                        }
                    });
                    return settings;
                } catch (error) {
                    console.error("[Settings] Failed to fetch system settings:", error);
                    return [];
                }
            },
            [`system-settings-${cacheKey}`],
            {
                tags: ["system-settings"],
                revalidate: 3600,
            }
        )(sortedKeys);
    })();

    inFlightRequests.set(cacheKey, request);

    try {
        return await request;
    } finally {
        // Clear from map once resolved so future calls (after revalidation) can trigger fresh data if needed
        // but during a single render cycle, it stays shared.
        inFlightRequests.delete(cacheKey);
    }
};

/**
 * Helper untuk mengambil nilai tunggal atau ganti dengan default.
 */
export async function getSettingValue(key: string, defaultValue: string = ""): Promise<string> {
    const settings = await getSystemSettings([key]);
    return settings.find((s: SystemSetting) => s.key === key)?.value || defaultValue;
}
