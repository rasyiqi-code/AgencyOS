import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { Prisma } from "@prisma/client";
import { stackServerApp } from "@/lib/config/stack";
import { sendOrderCancelledEmail } from "@/lib/email/client-notifications";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    // Auth check: Admin only
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

        const updates: Prisma.PrismaPromise<unknown>[] = [
            // 1. Update Estimate Status
            prisma.estimate.update({
                where: { id: estimateId },
                data: { status: 'cancelled' }
            })
        ];

        // 2. Update Project Status (if exists)
        if (estimate.project) {
            updates.push(
                prisma.project.update({
                    where: { id: estimate.project.id },
                    data: {
                        status: 'cancelled',
                        paymentStatus: 'UNPAID' // Reset payment status if cancelled
                    }
                })
            );

            // 3. Cancel associated pending/waiting orders
            const pendingOrderIds = estimate.project.orders
                .filter(o => o.status === 'pending' || o.status === 'waiting_verification')
                .map(o => o.id);

            if (pendingOrderIds.length > 0) {
                updates.push(
                    prisma.order.updateMany({
                        where: { id: { in: pendingOrderIds } },
                        data: { status: 'cancelled' }
                    })
                );
            }
        }

        await prisma.$transaction(updates);

        // --- Notifications ---
        if (estimate.project) {
            try {
                const stackUser = await stackServerApp.getUser(estimate.project.userId);
                if (stackUser && stackUser.primaryEmail) {
                    sendOrderCancelledEmail({
                        to: stackUser.primaryEmail,
                        customerName: stackUser.displayName || stackUser.primaryEmail.split('@')[0] || "Client",
                        orderId: estimateId,
                        productName: estimate.title
                    }).catch(err => console.error("Cancellation notification error:", err));
                }
            } catch (err) {
                console.error("Failed to fetch user for cancellation notification:", err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
