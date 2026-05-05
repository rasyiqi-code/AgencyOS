import { describe, expect, it } from "bun:test";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
    it("should handle null or undefined input", () => {
        expect(sanitizeHtml(null)).toBe("");
        expect(sanitizeHtml(undefined)).toBe("");
    });

    it("should handle empty string input", () => {
        expect(sanitizeHtml("")).toBe("");
    });

    it("should preserve valid HTML elements", () => {
        const input = "<div><p>Hello, <strong>world</strong>!</p></div>";
        expect(sanitizeHtml(input)).toBe(input);
    });

    it("should remove harmful script tags", () => {
        const input = "<div>Hello</div><script>alert('XSS')</script>";
        expect(sanitizeHtml(input)).toBe("<div>Hello</div>");
    });

    it("should remove inline event handlers", () => {
        const input = '<img src="valid.jpg" onerror="alert(\'XSS\')" />';
        expect(sanitizeHtml(input)).toBe('<img src="valid.jpg">');
    });

    it("should remove dangerous href attributes", () => {
        const input = '<a href="javascript:alert(\'XSS\')">Click me</a>';
        // DOMPurify removes the javascript: href attribute but keeps the tag
        expect(sanitizeHtml(input)).toBe("<a>Click me</a>");
    });

    it("should preserve safe attributes", () => {
        const input = '<a href="https://example.com" class="link" id="my-link" target="_blank">Safe Link</a>';
        // target="_blank" is often removed by default config depending on rules,
        // but id, class, and href are standard safe attributes
        expect(sanitizeHtml(input)).toBe('<a href="https://example.com" class="link" id="my-link">Safe Link</a>');
    });
});
