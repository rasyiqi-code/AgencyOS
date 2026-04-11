import { describe, expect, it } from "bun:test";
import { secureRandomInt, secureRandomAlphanumeric } from "./crypto";

describe("crypto utils", () => {
    describe("secureRandomInt", () => {
        it("should generate a number within the specified bounds", () => {
            const min = 10;
            const max = 20;
            // Run multiple times to ensure bounds are consistently respected
            for (let i = 0; i < 100; i++) {
                const result = secureRandomInt(min, max);
                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThan(max);
            }
        });

        it("should handle min of 0 and small max", () => {
            const min = 0;
            const max = 5;
            for (let i = 0; i < 50; i++) {
                const result = secureRandomInt(min, max);
                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThan(max);
            }
        });

        it("should throw an error if min is greater than or equal to max", () => {
            expect(() => secureRandomInt(10, 10)).toThrow();
            expect(() => secureRandomInt(10, 5)).toThrow();
        });
    });

    describe("secureRandomAlphanumeric", () => {
        it("should generate a string of the specified length", () => {
            const lengths = [1, 5, 10, 16, 32];
            for (const len of lengths) {
                const result = secureRandomAlphanumeric(len);
                expect(result).toHaveLength(len);
            }
        });

        it("should only contain alphanumeric characters", () => {
            const result = secureRandomAlphanumeric(100);
            expect(result).toMatch(/^[a-z0-9]+$/);
        });

        it("should return an empty string for length 0", () => {
            const result = secureRandomAlphanumeric(0);
            expect(result).toBe("");
        });

        it("should generate different strings on subsequent calls", () => {
            const result1 = secureRandomAlphanumeric(16);
            const result2 = secureRandomAlphanumeric(16);
            expect(result1).not.toBe(result2);
        });
    });
});
