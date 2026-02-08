
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const estimateId = params.id;

    try {
        const estimate = await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
                project: {
                    include: { orders: true }
                }
            }
        });

        if (!estimate) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // 1. Identify Pending/Waiting Orders
        const pendingOrders = estimate.project?.orders?.filter(o =>
            o.status === 'pending' || o.status === 'waiting_verification'
        ) || [];

        // Default to FULL payment assumption if no specific order found
        let paymentType = 'FULL';
        let amountPaid = estimate.project?.totalAmount || 0;

        if (pendingOrders.length > 0) {
            // Use the type of the pending order
            // Prefer DP if listed, logic can be adjusted
            const targetOrder = pendingOrders[0];
            paymentType = targetOrder.type;
            amountPaid = targetOrder.amount;
        }

        // 2. Determine New Statuses
        let newProjectPaymentStatus = 'PAID';
        const newProjectStatus = 'queue'; // Active

        if (paymentType === 'DP') {
            newProjectPaymentStatus = 'PARTIAL';
            // Estimate stays open for repayment
            // But if we mark estimate as paid, frontend might hide "Pay" button?
            // Let's stick to 'paid' for estimate only if fully paid.
        }

        // 3. Mark Estimate
        // Only mark estimate as 'paid' if it's full or repayment completion
        if (paymentType !== 'DP') {
            await prisma.estimate.update({
                where: { id: estimateId },
                data: { status: 'paid' }
            });
        }

        // 4. Activate Project (if linked) and Sync Order
        if (estimate.project) {
            // Calculate total paid including this confirmation
            const currentPaid = estimate.project.paidAmount || 0;
            const finalPaidAmount = paymentType === 'DP' ? currentPaid + amountPaid : estimate.project.totalAmount;

            // Update Project
            await prisma.project.update({
                where: { id: estimate.project.id },
                data: {
                    status: newProjectStatus,
                    paymentStatus: newProjectPaymentStatus,
                    paidAmount: finalPaidAmount
                }
            });

            // 5. Sync Identified Orders
            if (pendingOrders.length > 0) {
                await prisma.order.updateMany({
                    where: {
                        id: { in: pendingOrders.map(o => o.id) }
                    },
                    data: { status: 'paid' }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Confirm Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
