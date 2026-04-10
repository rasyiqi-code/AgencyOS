import { describe, expect, it } from "bun:test";
import { slugify } from "./utils";

describe("slugify", () => {
    it("should convert simple string to lowercase slug", () => {
        expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should replace multiple spaces with a single dash", () => {
        expect(slugify("Hello   World")).toBe("hello-world");
    });

    it("should remove non-word characters except dashes", () => {
        expect(slugify("Hello! @World# &!123")).toBe("hello-world-123");
    });

    it("should trim whitespaces from start and end", () => {
        expect(slugify("   Hello World   ")).toBe("hello-world");
    });

    it("should replace multiple consecutive dashes with a single dash", () => {
        expect(slugify("hello---world")).toBe("hello-world");
    });

    it("should trim dashes from the start and end of the string", () => {
        expect(slugify("---hello-world---")).toBe("hello-world");
        expect(slugify(" - Hello - World - ")).toBe("hello-world");
    });

    it("should handle non-string inputs that have a toString method", () => {
        expect(slugify(12345 as any)).toBe("12345");
    });

    it("should handle empty strings", () => {
        expect(slugify("")).toBe("");
        expect(slugify("   ")).toBe("");
        expect(slugify("---")).toBe("");
    });
});
