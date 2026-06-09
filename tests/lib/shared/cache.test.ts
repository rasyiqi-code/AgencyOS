import { describe, expect, it, mock, spyOn } from "bun:test";
import { safeUnstableCache } from "@/lib/shared/cache";
import * as nextCache from "next/cache";

describe("safeUnstableCache", () => {
    it("should resolve the cached function value successfully on happy path", async () => {
        const mockFn = mock(async () => "database_value");
        
        // Mock unstable_cache bawaan Next.js agar mengembalikan wrapper fungsi asli
        const unstableCacheSpy = spyOn(nextCache, "unstable_cache").mockImplementation(
            (cb) => cb
        );

        const cached = safeUnstableCache(mockFn, ["test-key"]);
        const result = await cached();

        expect(result).toBe("database_value");
        expect(mockFn).toHaveBeenCalledTimes(1);
        
        unstableCacheSpy.mockRestore();
    });

    it("should fallback to raw function call when unstable_cache throws incrementalCache missing error", async () => {
        const mockFn = mock(async () => "fallback_database_value");

        // Mock unstable_cache agar melempar error invariant Next.js 15+
        const unstableCacheSpy = spyOn(nextCache, "unstable_cache").mockImplementation((cb) => {
            if (!cb) throw new Error("Callback required");
            return (async () => {
                throw new Error("Invariant: incrementalCache missing in unstable_cache");
            }) as unknown as typeof cb;
        });

        const cached = safeUnstableCache(mockFn, ["test-key"]);
        const result = await cached();

        expect(result).toBe("fallback_database_value");
        expect(mockFn).toHaveBeenCalledTimes(1); // Fungsi asli dipanggil secara langsung

        unstableCacheSpy.mockRestore();
    });

    it("should re-throw other database/unexpected errors", async () => {
        const mockFn = mock(async () => "database_value");

        // Mock unstable_cache agar melempar database error biasa
        const unstableCacheSpy = spyOn(nextCache, "unstable_cache").mockImplementation((cb) => {
            if (!cb) throw new Error("Callback required");
            return (async () => {
                throw new Error("Prisma: Connection failed");
            }) as unknown as typeof cb;
        });

        const cached = safeUnstableCache(mockFn, ["test-key"]);

        expect(cached()).rejects.toThrow("Prisma: Connection failed");
        expect(mockFn).toHaveBeenCalledTimes(0); // Fungsi asli tidak dipanggil karena error dilempar ulang

        unstableCacheSpy.mockRestore();
    });
});
