import { describe, expect, it } from "bun:test";
import { calculateProjectQuote, pricingConfig, type QuoteParams } from "./pricing";

describe("calculateProjectQuote", () => {
    const defaultFeatures = {
        auth: false,
        payment: false,
        cms: false,
        ai: false,
        realtime: false,
    };

    it("should calculate a basic project quote correctly (low complexity, 1 page)", () => {
        const params: QuoteParams = {
            complexity: 'low',
            pages: 1,
            features: { ...defaultFeatures },
        };

        const result = calculateProjectQuote(params);

        // subtotal = 5,000,000 (base) + (1 * 1,000,000) (page) = 6,000,000
        // total = 6,000,000 * 1 = 6,000,000
        expect(result.totalPrice).toBe(6_000_000);
        expect(result.formattedPrice).toContain("6.000.000");

        // duration = ceil((2 + 0*0.5 + 1*0.2) * (1 * 0.8)) = ceil(2.2 * 0.8) = ceil(1.76) = 2
        expect(result.estimatedDuration).toBe(2);

        expect(result.breakdown.base).toBe(pricingConfig.baseRate);
        expect(result.breakdown.pages).toBe(1_000_000);
        expect(result.breakdown.features).toBe(0);
        expect(result.breakdown.multiplier).toBe(1);
    });

    it("should scale with pages correctly", () => {
        const params: QuoteParams = {
            complexity: 'low',
            pages: 10,
            features: { ...defaultFeatures },
        };

        const result = calculateProjectQuote(params);

        // subtotal = 5,000,000 + (10 * 1,000,000) = 15,000,000
        expect(result.totalPrice).toBe(15_000_000);
        // duration = ceil((2 + 10*0.2) * 0.8) = ceil(4 * 0.8) = ceil(3.2) = 4
        expect(result.estimatedDuration).toBe(4);
        expect(result.breakdown.pages).toBe(10_000_000);
    });

    it("should handle features correctly", () => {
        const params: QuoteParams = {
            complexity: 'low',
            pages: 1,
            features: {
                ...defaultFeatures,
                auth: true, // 2,500,000
                ai: true,   // 5,000,000
            },
        };

        const result = calculateProjectQuote(params);

        // subtotal = 5,000,000 (base) + 1,000,000 (page) + 2,500,000 (auth) + 5,000,000 (ai) = 13,500,000
        expect(result.totalPrice).toBe(13_500_000);
        // duration = ceil((2 + 2*0.5 + 1*0.2) * 0.8) = ceil(3.2 * 0.8) = ceil(2.56) = 3
        expect(result.estimatedDuration).toBe(3);
        expect(result.breakdown.features).toBe(7_500_000);
    });

    it("should apply medium complexity multiplier correctly", () => {
        const params: QuoteParams = {
            complexity: 'medium', // 1.5x
            pages: 1,
            features: { ...defaultFeatures },
        };

        const result = calculateProjectQuote(params);

        // subtotal = 6,000,000
        // total = 6,000,000 * 1.5 = 9,000,000
        expect(result.totalPrice).toBe(9_000_000);
        // duration = ceil(2.2 * (1.5 * 0.8)) = ceil(2.2 * 1.2) = ceil(2.64) = 3
        expect(result.estimatedDuration).toBe(3);
        expect(result.breakdown.multiplier).toBe(1.5);
    });

    it("should apply high complexity multiplier correctly", () => {
        const params: QuoteParams = {
            complexity: 'high', // 2.2x
            pages: 1,
            features: { ...defaultFeatures },
        };

        const result = calculateProjectQuote(params);

        // subtotal = 6,000,000
        // total = 6,000,000 * 2.2 = 13,200,000
        expect(result.totalPrice).toBe(13_200_000);
        // duration = ceil(2.2 * (2.2 * 0.8)) = ceil(2.2 * 1.76) = ceil(3.872) = 4
        expect(result.estimatedDuration).toBe(4);
        expect(result.breakdown.multiplier).toBe(2.2);
    });

    it("should handle all features and high complexity", () => {
        const params: QuoteParams = {
            complexity: 'high',
            pages: 5,
            features: {
                auth: true,
                payment: true,
                cms: true,
                ai: true,
                realtime: true,
            },
        };

        const result = calculateProjectQuote(params);

        // subtotal = 5M (base) + 5M (pages) + 2.5M (auth) + 3.5M (pay) + 2M (cms) + 5M (ai) + 3M (rt)
        // subtotal = 5 + 5 + 2.5 + 3.5 + 2 + 5 + 3 = 26,000,000
        // total = 26,000,000 * 2.2 = 57,200,000
        expect(result.totalPrice).toBe(57_200_000);

        // duration = (2 + 5*0.5 + 5*0.2) = 2 + 2.5 + 1 = 5.5
        // final duration = ceil(5.5 * (2.2 * 0.8)) = ceil(5.5 * 1.76) = ceil(9.68) = 10
        expect(result.estimatedDuration).toBe(10);

        expect(result.breakdown.base).toBe(5_000_000);
        expect(result.breakdown.pages).toBe(5_000_000);
        expect(result.breakdown.features).toBe(16_000_000);
    });
});
