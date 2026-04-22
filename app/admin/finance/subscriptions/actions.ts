"use server";

import { prisma } from "@/lib/config/db";
import { canManageBilling } from "@/lib/shared/auth-helpers";
import { revalidatePath } from "next/cache";

export async function generateRenewalInvoice({
    projectId,
    amount,
    summary
}: {
    projectId: string;
    amount: number;
    summary: string;
}) {
    const hasAccess = await canManageBilling();
    if (!hasAccess) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { estimate: true, service: true }
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // We use the existing Estimate as a template to copy screens/apis, if available
        const oldEstimate = project.estimate;

        // Determine complexity
        const complexity = "Subscription Renewal";

        const newEstimate = await prisma.estimate.create({
            data: {
                title: `Renewal: ${project.title}`,
                prompt: "Subscription Renewal",
                summary: summary,
                screens: oldEstimate?.screens || [],
                apis: oldEstimate?.apis || [],
                totalHours: oldEstimate?.totalHours || 0,
                totalCost: amount,
                complexity: complexity,
                status: "pending_payment",
                serviceId: project.serviceId,
                userId: project.userId,
            }
        });

        // Update Project to point to the new Estimate so the client pays THIS new estimate
        await prisma.project.update({
            where: { id: projectId },
            data: { 
                estimateId: newEstimate.id,
                subscriptionStatus: 'pending' // They need to pay the renewal
            }
        });

        // Revalidate pages
        revalidatePath("/admin/finance/subscriptions");
        revalidatePath("/admin/finance/orders");
        revalidatePath("/id/dashboard/billing");
        revalidatePath("/en/dashboard/billing");

        return { success: true, estimateId: newEstimate.id };

    } catch (error: unknown) {
        console.error("Failed to generate renewal invoice:", error);
        return { success: false, error: error instanceof Error ? error.message : "Internal server error" };
    }
}
