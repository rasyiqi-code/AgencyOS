import { describe, expect, it, mock, beforeEach, afterEach, spyOn } from "bun:test";
import { CurrencyService } from "./currency-service";
import { prisma } from "@/lib/config/db";

// Mock prisma properly to avoid DB connection issues
mock.module("@/lib/config/db", () => ({
    prisma: {
        systemSetting: {
            findUnique: mock(),
            upsert: mock(),
        }
    }
}));

describe("CurrencyService.fetchAndCacheRates", () => {
    let service: CurrencyService;
    let fetchMock: unknown;

    beforeEach(() => {
        service = new CurrencyService();
        fetchMock = mock();
        global.fetch = fetchMock;

        // Default mocks
        (prisma.systemSetting.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
        (prisma.systemSetting.upsert as ReturnType<typeof mock>).mockResolvedValue({} as unknown as Record<string, unknown>);
    });

    afterEach(() => {
        mock.restore();
    });

    it("should handle error paths and fallback to cached rates on API failure", async () => {
        // 1. Setup fetch to fail
        fetchMock.mockRejectedValue(new Error("Network Error"));

        // 2. Setup prisma to return a cached value when fallback is needed
        (prisma.systemSetting.findUnique as ReturnType<typeof mock>).mockResolvedValue({
            key: "currency_rates",
            value: JSON.stringify({ base: "USD", rates: { IDR: 15500 }, lastUpdated: Date.now() }),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Suppress console error/warn in tests
        const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.fetchAndCacheRates("fake-api-key");

        // Expectations
        expect(fetchMock).toHaveBeenCalledTimes(2); // MAX_RETRIES = 2
        expect(result).not.toBeNull();
        expect(result?.rates.IDR).toBe(15500); // from cached

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it("should handle invalid API response structure", async () => {
        // 1. Setup fetch to return success but invalid format
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            somethingElse: "wrong"
        }), { status: 200 }));

        // 2. Setup prisma to return null for cache (no fallback)
        (prisma.systemSetting.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

        const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.fetchAndCacheRates("fake-api-key");

        expect(fetchMock).toHaveBeenCalledTimes(2); // should retry
        expect(result).toBeNull(); // no cache available

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it("should handle API non-ok status codes", async () => {
        fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
        (prisma.systemSetting.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

        const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.fetchAndCacheRates("fake-api-key");

        expect(fetchMock).toHaveBeenCalledTimes(2); // should retry
        expect(result).toBeNull(); // no cache available

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it("should handle AbortError correctly (timeout simulation)", async () => {
        // Mock a delayed fetch that will be aborted
        fetchMock.mockImplementation(() => {
            const error = new Error("The operation was aborted");
            error.name = "AbortError";
            return Promise.reject(error);
        });

        (prisma.systemSetting.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

        const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.fetchAndCacheRates("fake-api-key");

        // Expectations
        expect(fetchMock).toHaveBeenCalledTimes(2); // Should retry
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Request timeout after"));
        expect(result).toBeNull(); // No cache available

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it("should return cached corrupted data as null without crashing", async () => {
        fetchMock.mockRejectedValue(new Error("Network Error"));

        // Setup prisma to return corrupted JSON
        (prisma.systemSetting.findUnique as ReturnType<typeof mock>).mockResolvedValue({
            key: "currency_rates",
            value: "invalid-json-data",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.fetchAndCacheRates("fake-api-key");

        // Expectations
        expect(result).toBeNull(); // Should catch the parsing error and return null

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it("should fetch rates successfully on happy path", async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            base: "USD",
            rates: { IDR: 15000 }
        }), { status: 200 }));

        const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.fetchAndCacheRates("fake-api-key");

        expect(fetchMock).toHaveBeenCalledTimes(1); // No retry needed
        expect(result).not.toBeNull();
        expect(result?.rates.IDR).toBe(15000);

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });
});
