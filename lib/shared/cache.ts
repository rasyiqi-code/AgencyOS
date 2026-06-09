import { unstable_cache } from "@/lib/cache";

/**
 * Sebuah wrapper aman di atas `unstable_cache` Next.js.
 * 
 * Di Next.js 15+, memanggil `unstable_cache` di dalam Route Handler dinamis (misalnya bertanda `force-dynamic`)
 * atau di luar konteks request Next.js yang standar akan memicu error:
 * "Invariant: incrementalCache missing in unstable_cache".
 * 
 * Wrapper ini menangkap error tersebut dan secara otomatis mem-bypass cache (langsung mengeksekusi
 * fungsi database/aslinya) agar aplikasi tidak crash dan API tetap berjalan dengan normal.
 */
export function safeUnstableCache<Args extends unknown[], Return>(
    cb: (...args: Args) => Promise<Return>,
    keyParts?: string[],
    options?: {
        revalidate?: number | false;
        tags?: string[];
    }
): (...args: Args) => Promise<Return> {
    const cachedFn = unstable_cache(cb as any, keyParts || [], options as any);

    return (async (...args: Args) => {
        try {
            return await cachedFn(...args) as Return;
        } catch (error: unknown) {
            const isMissingCache = error instanceof Error && 
                (error.message.includes("incrementalCache missing") || 
                 error.message.includes("Invariant:"));
            
            if (isMissingCache) {
                console.warn(
                    `[safeUnstableCache] Mem-bypass cache dan memanggil fungsi asli karena incrementalCache tidak tersedia untuk kunci:`,
                    keyParts
                );
                return await cb(...args);
            }
            throw error;
        }
    });
}
