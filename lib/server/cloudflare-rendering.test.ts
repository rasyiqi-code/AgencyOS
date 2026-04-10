import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from "bun:test";

// Mock next/cache before importing the module that uses it
mock.module("next/cache", () => ({
    unstable_cache: (cb: any) => cb
}));

mock.module("@/lib/server/settings", () => ({
    getSettingValue: async (key: string) => {
        if (key === "cloudflare_account_id") return "mock_account_id";
        if (key === "cloudflare_api_token") return "mock_api_token";
        return null;
    }
}));

import { fetchRenderedHtml, enhanceHtml } from "./cloudflare-rendering";

describe("cloudflare-rendering", () => {
    let globalFetchSpy: any;

    beforeEach(() => {
        globalFetchSpy = spyOn(globalThis, "fetch");
    });

    afterEach(() => {
        globalFetchSpy.mockRestore();
    });

    describe("fetchRenderedHtml", () => {
        it("should return enhanced HTML on successful browser rendering", async () => {
            const mockHtml = "<html><head></head><body><h1>Hello</h1></body></html>";

            globalFetchSpy.mockResolvedValueOnce({
                ok: true,
                headers: {
                    get: (header: string) => header === "content-type" ? "text/html" : null
                },
                text: async () => mockHtml
            } as any);

            const result = await fetchRenderedHtml("https://example.com/"); // Add trailing slash for exact matching

            expect(globalFetchSpy).toHaveBeenCalledTimes(1);
            expect(result).toContain("<base href=\"https://example.com/\">");
            expect(result).toContain("<h1>Hello</h1>");
        });

        it("should fall back to raw HTML fetch on 429 Rate Limited response", async () => {
            const mockFallbackHtml = "<html><head></head><body><h1>Fallback HTML</h1></body></html>";

            // First fetch returns 429
            globalFetchSpy.mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: async () => "Rate limit exceeded"
            } as any);

            // Second fetch (fallback) returns successful raw HTML
            globalFetchSpy.mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: {
                    get: (header: string) => header === "content-type" ? "text/html" : null
                },
                text: async () => mockFallbackHtml
            } as any);

            const result = await fetchRenderedHtml("https://example.com/"); // Add trailing slash for exact matching

            expect(globalFetchSpy).toHaveBeenCalledTimes(2);

            // Verify first call was to Cloudflare
            expect(globalFetchSpy.mock.calls[0][0]).toBe("https://api.cloudflare.com/client/v4/accounts/mock_account_id/browser-rendering/content");
            expect(globalFetchSpy.mock.calls[0][1].method).toBe("POST");

            // Verify second call was the fallback to the original URL
            expect(globalFetchSpy.mock.calls[1][0]).toBe("https://example.com/");
            expect(globalFetchSpy.mock.calls[1][1].headers["User-Agent"]).toContain("Mozilla");

            expect(result).toContain("<base href=\"https://example.com/\">");
            expect(result).toContain("<h1>Fallback HTML</h1>");
        });
    });
});
