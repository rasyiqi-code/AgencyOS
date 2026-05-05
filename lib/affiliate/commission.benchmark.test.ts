import { describe, expect, it, mock, beforeEach } from "bun:test";
import { processAffiliateCommission, processAffiliateCommissionsBulk } from "./commission";

const mockPrisma = {
    affiliateProfile: {
        findUnique: mock(),
        findMany: mock(),
        update: mock(),
    },
    commissionLog: {
        findFirst: mock(),
        findMany: mock(),
        create: mock(),
        createMany: mock(),
    },
    $transaction: mock()
};

mock.module("@/lib/config/db", () => ({
    prisma: mockPrisma
}));

mock.module("@/lib/email/affiliate-emails", () => ({
    sendCommissionEmail: mock().mockResolvedValue(true)
}));

mock.module("resend", () => ({
    Resend: class {}
}));

describe("Affiliate Commission Benchmarks", () => {
    beforeEach(() => {
        mockPrisma.affiliateProfile.findUnique.mockClear();
        mockPrisma.affiliateProfile.findMany.mockClear();
        mockPrisma.affiliateProfile.update.mockClear();
        mockPrisma.commissionLog.findFirst.mockClear();
        mockPrisma.commissionLog.findMany.mockClear();
        mockPrisma.commissionLog.create.mockClear();
        mockPrisma.commissionLog.createMany.mockClear();
        mockPrisma.$transaction.mockClear();
    });

    it("unoptimized baseline: sequential for...of loop", async () => {
        const orderCount = 50;
        const orders = Array.from({ length: orderCount }).map((_, i) => ({
            id: `ORD-${i}`,
            amount: 100,
            paymentMetadata: { affiliate_code: "TEST" }
        }));

        // Simulate DB delays
        mockPrisma.affiliateProfile.findUnique.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 5));
            return { id: "aff-1", referralCode: "TEST", commissionRate: 10, status: "active", email: "test@test.com", name: "Test" };
        });
        mockPrisma.commissionLog.findFirst.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 5));
            return null; // Ensure commission doesn't exist so we write it
        });
        mockPrisma.$transaction.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 10));
            return true;
        });

        const start = performance.now();
        for (const order of orders) {
            await processAffiliateCommission(order.id, order.amount, order.paymentMetadata);
        }
        const end = performance.now();
        console.log(`Unoptimized (Sequential for...of): ${(end - start).toFixed(2)}ms for ${orderCount} orders`);

        expect(mockPrisma.affiliateProfile.findUnique).toHaveBeenCalledTimes(orderCount);
        expect(mockPrisma.commissionLog.findFirst).toHaveBeenCalledTimes(orderCount);
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(orderCount);
    });

    it("baseline: Promise.all of processAffiliateCommission (concurrent N+1 queries)", async () => {
        const orderCount = 50;
        const orders = Array.from({ length: orderCount }).map((_, i) => ({
            id: `ORD-${i}`,
            amount: 100,
            paymentMetadata: { affiliate_code: "TEST" }
        }));

        // Simulate DB delays
        mockPrisma.affiliateProfile.findUnique.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 5));
            return { id: "aff-1", referralCode: "TEST", commissionRate: 10, status: "active", email: "test@test.com", name: "Test" };
        });
        mockPrisma.commissionLog.findFirst.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 5));
            return null; // Ensure commission doesn't exist so we write it
        });
        mockPrisma.$transaction.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 10));
            return true;
        });

        const start = performance.now();
        await Promise.all(
            orders.map(order =>
                processAffiliateCommission(order.id, order.amount, order.paymentMetadata)
            )
        );
        const end = performance.now();
        console.log(`Baseline (Promise.all): ${(end - start).toFixed(2)}ms for ${orderCount} orders`);

        expect(mockPrisma.affiliateProfile.findUnique).toHaveBeenCalledTimes(orderCount);
        expect(mockPrisma.commissionLog.findFirst).toHaveBeenCalledTimes(orderCount);
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(orderCount);
    });

    it("optimized: processAffiliateCommissionsBulk (single query)", async () => {
        const orderCount = 50;
        const orders = Array.from({ length: orderCount }).map((_, i) => ({
            id: `ORD-${i}`,
            amount: 100,
            paymentMetadata: { affiliate_code: "TEST" }
        }));

        // Simulate DB delays
        mockPrisma.affiliateProfile.findMany.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 5));
            return [{ id: "aff-1", referralCode: "TEST", commissionRate: 10, status: "active", email: "test@test.com", name: "Test" }];
        });
        mockPrisma.commissionLog.findMany.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 5));
            return []; // No existing
        });
        mockPrisma.$transaction.mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 10));
            return true;
        });

        const start = performance.now();
        await processAffiliateCommissionsBulk(orders);
        const end = performance.now();
        console.log(`Optimized (processAffiliateCommissionsBulk): ${(end - start).toFixed(2)}ms for ${orderCount} orders`);

        // Single call for affiliates
        expect(mockPrisma.affiliateProfile.findMany).toHaveBeenCalledTimes(1);
        // Single call for existing commissions
        expect(mockPrisma.commissionLog.findMany).toHaveBeenCalledTimes(1);
        // Single transaction
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
});
