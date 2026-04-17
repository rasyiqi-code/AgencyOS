
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { processAffiliateCommission } from "@/lib/affiliate/commission";
import { stackServerApp } from "@/lib/config/stack";
import { notifyPaymentSuccess } from "@/lib/email/admin-notifications";
import { sendPaymentSuccessEmail } from "@/lib/email/client-notifications";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    // Auth check: konfirmasi pembayaran manual hanya boleh dilakukan admin
    // Tanpa ini, user biasa bisa mengaktifkan project tanpa membayar
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetId = params.id;
    const isOrderId = targetId.startsWith('ORDER-');

    try {
        let estimateId = isOrderId ? null : targetId;
        let orderFromId = null;

        // 1. Resolve the actual estimate and project
        if (isOrderId) {
            orderFromId = await prisma.order.findUnique({
                where: { id: targetId },
                include: {
                    project: {
                        include: {
                            estimate: true
                        }
                    }
                }
            });
            estimateId = orderFromId?.project?.estimate?.id || null;
        }

        // Fetch estimate (existing logic but flexible)
        const estimate = estimateId ? await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
                project: {
                    include: { orders: true }
                }
            }
        }) : null;

        // If no estimate and it was an order, try to work with project directly
        const project = estimate?.project || orderFromId?.project;

        if (!project && !estimate) {
            return NextResponse.json({ error: "Transaction/Invoice not found" }, { status: 404 });
        }

        // 2. Identify Pending/Waiting Orders
        // If we came from an order ID, that specific order is our target
        const pendingOrders = isOrderId && orderFromId
            ? [orderFromId]
            : ((project as Record<string, unknown>)?.orders as { id: string; status: string; type: string; amount: number; currency: string; exchangeRate: number | null; paymentMetadata: unknown }[] || []).filter((o) =>
                o.status === 'pending' || o.status === 'waiting_verification'
            );

        // Default to FULL payment assumption if no specific order found
        let paymentType = isOrderId && orderFromId ? (orderFromId.type || 'FULL') : 'FULL';
        let amountPaid = isOrderId && orderFromId ? orderFromId.amount : (project?.totalAmount || 0);

        if (!isOrderId && pendingOrders.length > 0) {
            const targetOrder = pendingOrders[0];
            paymentType = targetOrder.type;
            const orderRate = targetOrder.exchangeRate || 1;
            amountPaid = targetOrder.currency === 'IDR' && targetOrder.amount > 5000
                ? targetOrder.amount / orderRate
                : targetOrder.amount;
        }

        const totalAmount = project?.totalAmount || estimate?.totalCost || 0;

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
        if (paymentType !== 'DP' && estimateId) {
            await prisma.estimate.update({
                where: { id: estimateId },
                data: { status: 'paid' }
            });
        }

        // 4. Activate Project (if linked) and Sync Order
        if (project) {
            // Calculate total paid including this confirmation
            const currentPaid = project.paidAmount || 0;
            const finalPaidAmount = paymentType === 'DP' ? currentPaid + amountPaid : totalAmount;

            // Update Project
            await prisma.project.update({
                where: { id: project.id },
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
                        id: { in: pendingOrders.map((o) => o.id) }
                    },
                    data: { status: 'paid' }
                });

                // ⚡ Bolt Optimization: Parallelize commission processing to avoid N+1 query pattern
                // 🎯 Why: Sequentially awaiting each commission call leads to unnecessary cumulative latency from DB lookups and transactions.
                // 📊 Impact: Measurably faster response time when confirming projects with multiple pending orders.
                await Promise.all(
                    pendingOrders.map((order) =>
                        processAffiliateCommission(order.id, order.amount, order.paymentMetadata)
                    )
                );
            }

            // --- Notifications ---
            try {
                const stackUser = await stackServerApp.getUser(project.userId);
                if (stackUser) {
                    const customerEmail = stackUser.primaryEmail || "";
                    const customerName = stackUser.displayName || customerEmail.split('@')[0] || "Client";

                    if (customerEmail) {
                        // Client Notification
                        sendPaymentSuccessEmail({
                            to: customerEmail,
                            customerName,
                            orderId: targetId,
                            amount: amountPaid,
                            productName: project.title || (estimate?.title) || "Service"
                        }).catch(err => console.error("Client notification error:", err));
                    }

                    // Admin Notification (Finalized)
                    notifyPaymentSuccess({
                        orderId: targetId,
                        amount: amountPaid,
                        customerName,
                        type: "SERVICE"
                    }).catch(err => console.error("Admin notification error:", err));
                }
            } catch (err) {
                console.error("Failed to fetch user for notifications:", err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Confirm Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
