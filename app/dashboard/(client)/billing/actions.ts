"use server";

import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { revalidatePath } from "next/cache";

export async function clientGenerateRenewalInvoice(projectId: string) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { estimate: true, service: true }
        });

        if (!project || project.userId !== user.id) {
            return { success: false, error: "Project not found or unauthorized" };
        }

        if (project.estimate?.status === "pending_payment" && project.estimate?.complexity === "Subscription Renewal") {
            // Invoice is already generated and pending
            return { success: true, estimateId: project.estimate.id };
        }

        const oldEstimate = project.estimate;
        
        // Cerdas memisahkan One-Time dan Monthly
        let amount = 0;
        if (project.service?.interval === 'monthly' || project.service?.interval === 'yearly') {
            amount += project.service.price;
        }

        // Parse summary untuk Add-ons yang berulang
        const summaryText = oldEstimate?.summary || project.description || "";
        const lines = summaryText.split('\n');
        lines.forEach(line => {
            if (line.includes('Monthly') || line.includes('Yearly')) {
                // Ekstrak angka harga. Contoh format: "($50 Monthly)" atau "(Rp50000 Monthly)"
                const match = line.match(/\(\D*([\d.]+)\s+(Monthly|Yearly)\)/i);
                if (match && match[1]) {
                    amount += parseFloat(match[1]);
                }
            }
        });

        // Fallback jika parser gagal (misal data legacy), gunakan totalAmount asli
        if (amount === 0 && project.totalAmount > 0) {
            amount = project.totalAmount;
        }

        const newEstimate = await prisma.estimate.create({
            data: {
                title: `Renewal: ${project.title}`,
                prompt: "Subscription Renewal",
                summary: "Otomatis dibuat oleh sistem untuk perpanjangan langganan. " + (project.description ? "\nTermasuk: \n" + project.description : ""),
                screens: oldEstimate?.screens || [],
                apis: oldEstimate?.apis || [],
                totalHours: oldEstimate?.totalHours || 0,
                totalCost: amount,
                complexity: "Subscription Renewal",
                status: "pending_payment",
                serviceId: project.serviceId,
                userId: project.userId,
            }
        });

        await prisma.project.update({
            where: { id: projectId },
            data: { 
                estimateId: newEstimate.id,
                subscriptionStatus: 'pending'
            }
        });

        revalidatePath("/id/dashboard/billing");
        revalidatePath("/en/dashboard/billing");
        revalidatePath("/admin/finance/subscriptions");
        revalidatePath("/admin/finance/orders");

        return { success: true, estimateId: newEstimate.id };

    } catch (error: unknown) {
        console.error("Failed to generate renewal invoice:", error);
        return { success: false, error: error instanceof Error ? error.message : "Internal server error" };
    }
}
