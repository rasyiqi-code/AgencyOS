import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { stackServerApp } from "@/lib/config/stack";

export async function PATCH(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { estimateId: targetId, status } = body;

        if (!targetId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isOrderId = targetId.startsWith('ORDER-');
        let actualEstimateId = isOrderId ? null : targetId;
        let orderFromId = null;

        // Resolve IDs
        if (isOrderId) {
            orderFromId = await prisma.order.findUnique({
                where: { id: targetId },
                include: {
                    project: {
                        include: { estimate: true }
                    }
                }
            });
            actualEstimateId = orderFromId?.project?.estimate?.id || null;
        }

        // Find estimate/project
        const estimate = actualEstimateId ? await prisma.estimate.findUnique({
            where: { id: actualEstimateId },
            include: { project: true }
        }) : null;

        const project = estimate?.project || orderFromId?.project;

        if (!project && !estimate) {
            return NextResponse.json({ error: "Transaction/Invoice not found" }, { status: 404 });
        }

        // Update Estimate status
        if (actualEstimateId) {
            await prisma.estimate.update({
                where: { id: actualEstimateId },
                data: { status }
            });
        }

        // Update Project status
        if (project) {
            await prisma.project.update({
                where: { id: project.id },
                data: { status }
            });
        }

        // --- Notifications ---
        if (project && status === "pending_payment") {
            try {
                const stackUser = await stackServerApp.getUser(project.userId);
                if (stackUser && stackUser.primaryEmail) {
                    const { sendPaymentRevertedEmail } = await import("@/lib/email/client-notifications");
                    sendPaymentRevertedEmail({
                        to: stackUser.primaryEmail,
                        customerName: stackUser.displayName || stackUser.primaryEmail.split('@')[0] || "Client",
                        orderId: targetId,
                        productName: project.title || estimate?.title || "Service"
                    }).catch(err => console.error("Revert notification error:", err));
                }
            } catch (err) {
                console.error("Failed to fetch user for revert notification:", err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
