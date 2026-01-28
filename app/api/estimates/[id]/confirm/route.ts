
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

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
                    include: { order: true }
                }
            }
        });

        if (!estimate) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        // 1. Mark Estimate as Paid
        await prisma.estimate.update({
            where: { id: estimateId },
            data: { status: 'paid' }
        });

        // 2. Activate Project (if linked) and Sync Order
        if (estimate.project) {
            await prisma.project.update({
                where: { id: estimate.project.id },
                data: { status: 'queue' } // Unlock for client
            });

            // 3. Sync Order Status if exists
            if (estimate.project.order) {
                await prisma.order.update({
                    where: { id: estimate.project.order.id },
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
