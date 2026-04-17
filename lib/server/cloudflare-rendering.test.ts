import { describe, expect, it } from "bun:test";

// Mock 'next/cache' module
import { mock } from "bun:test";

mock.module("next/cache", () => {
  return {
    unstable_cache: (fn: unknown) => fn
  };
});

mock.module("@/lib/server/settings", () => ({
    getSettingValue: async () => "mock",
    getSystemSettings: async () => []
}));

mock.module("@/lib/config/db", () => ({
    prisma: {}
}));

import { enhanceHtml } from "./cloudflare-rendering";

describe("enhanceHtml", () => {
    const validUrl = "https://example.com/path/page.html?query=1#hash";
    const localBaseUrl = "http://localhost:3000";

    describe("Base Tag Insertion", () => {
        it("should insert a <base> tag into <head> if it does not exist", () => {
            const html = "<html><head><title>Test</title></head><body></body></html>";
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            expect(enhanced).toContain('<head><base href="https://example.com/path/">');
            expect(enhanced).toContain('<title>Test</title>');
        });

        it("should handle base URLs that already end with a slash", () => {
            const html = "<html><head></head><body></body></html>";
            const enhanced = enhanceHtml(html, "https://example.com/path/", localBaseUrl);
            expect(enhanced).toContain('<head><base href="https://example.com/path/">');
        });

        it("should not insert a <base> tag if one already exists", () => {
            const html = '<html><head><base href="/custom/"><title>Test</title></head><body></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            expect(enhanced).not.toContain('<base href="https://example.com/path/">');
            expect(enhanced).toContain('<base href="/custom/">');
        });

        it("should not insert a <base> tag if <head> does not exist", () => {
            const html = "<html><body><p>No head</p></body></html>";
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            expect(enhanced).not.toContain("<base");
            expect(enhanced).toBe(html);
        });
    });

    describe("Font Proxying (Relative)", () => {
        it("should rewrite relative font paths to use the absolute local proxy URL", () => {
            const html = '<html><head></head><body><link href="/fonts/myfont.woff2" rel="stylesheet"></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://example.com/fonts/myfont.woff2`;
            expect(enhanced).toContain(`href="${expectedUrl}"`);
        });

        it("should support fonts with query parameters", () => {
            const html = '<html><head></head><body><link href="/fonts/myfont.ttf?v=1.0" rel="stylesheet"></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://example.com/fonts/myfont.ttf?v=1.0`;
            expect(enhanced).toContain(`href="${expectedUrl}"`);
        });

        it("should work without a localBaseUrl provided", () => {
             const html = '<html><head></head><body><link href="/fonts/myfont.woff2" rel="stylesheet"></body></html>';
             const enhanced = enhanceHtml(html, validUrl);
             const expectedUrl = `/api/proxy/asset?url=https://example.com/fonts/myfont.woff2`;
             expect(enhanced).toContain(`href="${expectedUrl}"`);
        });
    });

    describe("Font Proxying (Absolute External)", () => {
        it("should wrap absolute external font URLs in the absolute Proxy URL", () => {
            const html = '<html><head></head><body><link href="https://fonts.com/awesome.woff" rel="stylesheet"></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://fonts.com/awesome.woff`;
            expect(enhanced).toContain(`href="${expectedUrl}"`);
        });

        it("should wrap absolute external font URLs without localBaseUrl", () => {
            const html = '<html><head></head><body><link href="https://fonts.com/awesome.woff" rel="stylesheet"></body></html>';
            const enhanced = enhanceHtml(html, validUrl);
            const expectedUrl = `/api/proxy/asset?url=https://fonts.com/awesome.woff`;
            expect(enhanced).toContain(`href="${expectedUrl}"`);
        });
    });

    describe("Internal <style> url() Patterns", () => {
        it("should rewrite relative paths starting with / in url()", () => {
            const html = '<html><head><style>@font-face { src: url("/assets/font.ttf"); }</style></head><body></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://example.com/assets/font.ttf`;
            expect(enhanced).toContain(`url("${expectedUrl}"`);
        });

        it("should rewrite relative paths without leading slash in url()", () => {
            const html = '<html><head><style>@font-face { src: url("assets/font.woff2"); }</style></head><body></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            // It resolves against baseDir, which is https://example.com/path/
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://example.com/path/assets/font.woff2`;
            expect(enhanced).toContain(`url("${expectedUrl}"`);
        });

        it("should rewrite absolute external paths in url()", () => {
            const html = '<html><head><style>@font-face { src: url("https://external.com/font.otf"); }</style></head><body></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://external.com/font.otf`;
            expect(enhanced).toContain(`url("${expectedUrl}"`);
        });

        it("should handle unquoted URLs inside url()", () => {
            const html = '<html><head><style>@font-face { src: url(/fonts/test.ttf); }</style></head><body></body></html>';
            const enhanced = enhanceHtml(html, validUrl, localBaseUrl);
            const expectedUrl = `${localBaseUrl}/api/proxy/asset?url=https://example.com/fonts/test.ttf`;
            expect(enhanced).toContain(`url("${expectedUrl}"`);
        });
    });

    describe("Error Handling", () => {
        it("should return the original HTML if an invalid URL throws an error", () => {
            const html = '<html><head></head><body></body></html>';
            // Suppress console.warn during test
            const originalWarn = console.warn;
            console.warn = () => {};

            const enhanced = enhanceHtml(html, "not-a-valid-url");

            // Restore console.warn
            console.warn = originalWarn;

            expect(enhanced).toBe(html);
        });
    });
});
