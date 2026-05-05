import { describe, it, expect, mock, beforeEach } from "bun:test";

const prismaMock = {
    estimate: {
        update: mock(() => Promise.resolve({ id: "est_1" })),
    },
    project: {
        update: mock(() => Promise.resolve({ id: "proj_1" })),
    },
};

mock.module("@/lib/config/db", () => ({
    prisma: prismaMock,
}));

import { prisma } from "@/lib/config/db";

describe("Checkout API Database Updates Performance", () => {
    beforeEach(() => {
        prismaMock.estimate.update.mockClear();
        prismaMock.project.update.mockClear();
    });

    const simulateNetworkLatency = () => new Promise(resolve => setTimeout(resolve, 10));

    it("Baseline: Sequential Updates", async () => {
        prismaMock.estimate.update.mockImplementation(async () => {
            await simulateNetworkLatency();
            return { id: "est_1" };
        });
        prismaMock.project.update.mockImplementation(async () => {
            await simulateNetworkLatency();
            return { id: "proj_1" };
        });

        const start = performance.now();

        // Baseline code
        const paymentType = 'REPAYMENT';
        const estimateId = 'est_1';
        const finalProjectId = 'proj_1';
        const updateData = { invoiceId: 'ord_1', totalAmount: 100 };

        if (paymentType === 'REPAYMENT' && estimateId) {
            await prisma.estimate.update({
                where: { id: estimateId },
                data: { status: 'pending_payment' }
            });
        }

        await prisma.project.update({
            where: { id: finalProjectId },
            data: updateData
        });

        const duration = performance.now() - start;
        console.log(`Baseline Sequential Duration: ${duration.toFixed(2)}ms`);

        expect(prismaMock.estimate.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.project.update).toHaveBeenCalledTimes(1);
    });

    it("Optimized: Parallel Updates", async () => {
        prismaMock.estimate.update.mockImplementation(async () => {
            await simulateNetworkLatency();
            return { id: "est_1" };
        });
        prismaMock.project.update.mockImplementation(async () => {
            await simulateNetworkLatency();
            return { id: "proj_1" };
        });

        const start = performance.now();

        // Optimized code
        const paymentType = 'REPAYMENT';
        const estimateId = 'est_1';
        const finalProjectId = 'proj_1';
        const updateData = { invoiceId: 'ord_1', totalAmount: 100 };

        const updates: Promise<unknown>[] = [];

        if (paymentType === 'REPAYMENT' && estimateId) {
            updates.push(
                prisma.estimate.update({
                    where: { id: estimateId },
                    data: { status: 'pending_payment' }
                })
            );
        }

        updates.push(
            prisma.project.update({
                where: { id: finalProjectId },
                data: updateData
            })
        );

        await Promise.all(updates);

        const duration = performance.now() - start;
        console.log(`Optimized Parallel Duration: ${duration.toFixed(2)}ms`);

        expect(prismaMock.estimate.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.project.update).toHaveBeenCalledTimes(1);
    });
});
