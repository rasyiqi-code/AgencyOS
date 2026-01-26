"use server";

import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

export async function finalizeEstimate(estimateId: string) {
    const user = await stackServerApp.getUser();

    if (!user) {
        // Should be handled by AuthGuard, but double check
        throw new Error("Unauthorized");
    }

    const estimate = await prisma.estimate.findUnique({
        where: { id: estimateId }
    });

    if (!estimate) {
        throw new Error("Estimate not found");
    }

    // Update Estimate Status
    await prisma.estimate.update({
        where: { id: estimateId },
        data: { status: "pending_payment" }
    });

    // Create Project if not exists (check by estimateId)
    // We use upsert to avoid duplicates if they click finalize multiple times
    // However, upsert requires a unique constraint. We added @unique to estimateId.
    await prisma.project.upsert({
        where: { estimateId: estimateId }, // Ensure estimateId has @unique in schema.prisma
        update: {}, // No update if exists
        create: {
            userId: user.id,
            title: estimate.title,
            description: estimate.summary,
            // Convert JSON to string for spec or just store a summary
            spec: JSON.stringify({ screens: estimate.screens, apis: estimate.apis }, null, 2),
            status: "pending_payment", // We need to make sure this is valid or add it
            estimateId: estimateId,
            developerId: null, // Unassigned
        }
    });

    return `/checkout/${estimateId}`;
}
