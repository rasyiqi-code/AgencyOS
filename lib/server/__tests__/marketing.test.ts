import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock next/cache
mock.module("next/cache", () => {
    return {
        revalidatePath: mock(),
        unstable_cache: (fn: any) => fn
    };
});

// Mock prisma client
mock.module("@/lib/config/db", () => {
    return {
        prisma: {
            coupon: {
                findUnique: mock(),
            }
        }
    };
});

import { validateCoupon } from "../marketing";
import { prisma } from "@/lib/config/db";

describe("validateCoupon", () => {
    beforeEach(() => {
        (prisma.coupon.findUnique as any).mockReset();
    });

    it("should return invalid if coupon is not found", async () => {
        (prisma.coupon.findUnique as any).mockResolvedValue(null);

        const result = await validateCoupon("NOTFOUND");
        expect(result).toEqual({ valid: false, message: "Invalid coupon code." });
    });

    it("should return invalid if coupon is inactive", async () => {
        (prisma.coupon.findUnique as any).mockResolvedValue({
            code: "INACTIVE",
            isActive: false,
        });

        const result = await validateCoupon("INACTIVE");
        expect(result).toEqual({ valid: false, message: "Coupon is inactive." });
    });

    it("should return invalid if coupon has expired", async () => {
        (prisma.coupon.findUnique as any).mockResolvedValue({
            code: "EXPIRED",
            isActive: true,
            expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
        });

        const result = await validateCoupon("EXPIRED");
        expect(result).toEqual({ valid: false, message: "Coupon has expired." });
    });

    it("should return invalid if coupon usage limit reached", async () => {
        (prisma.coupon.findUnique as any).mockResolvedValue({
            code: "LIMITREACHED",
            isActive: true,
            expiresAt: new Date(Date.now() + 10000), // Valid in the future
            maxUses: 10,
            usedCount: 10,
        });

        const result = await validateCoupon("LIMITREACHED");
        expect(result).toEqual({ valid: false, message: "Coupon usage limit reached." });
    });

    it("should return invalid if coupon is not valid for context", async () => {
        (prisma.coupon.findUnique as any).mockResolvedValue({
            code: "NOCONTEXT",
            isActive: true,
            expiresAt: null,
            maxUses: null,
            usedCount: 0,
            appliesTo: ["DIGITAL"],
        });

        const result = await validateCoupon("NOCONTEXT", "SERVICE");
        expect(result).toEqual({ valid: false, message: "Coupon is not valid for service." });
    });

    it("should return valid and the coupon if everything is correct", async () => {
        const validCoupon = {
            code: "VALID",
            isActive: true,
            expiresAt: new Date(Date.now() + 10000),
            maxUses: 10,
            usedCount: 5,
            appliesTo: ["DIGITAL", "SERVICE"],
        };

        (prisma.coupon.findUnique as any).mockResolvedValue(validCoupon);

        const result = await validateCoupon("VALID", "SERVICE");
        expect(result).toEqual({ valid: true, coupon: validCoupon });
    });

    it("should return valid and the coupon if everything is correct without context", async () => {
        const validCoupon = {
            code: "VALID",
            isActive: true,
            expiresAt: null,
            maxUses: null,
            usedCount: 0,
            appliesTo: ["DIGITAL", "SERVICE", "CALCULATOR"],
        };

        (prisma.coupon.findUnique as any).mockResolvedValue(validCoupon);

        const result = await validateCoupon("VALID");
        expect(result).toEqual({ valid: true, coupon: validCoupon });
    });
});
