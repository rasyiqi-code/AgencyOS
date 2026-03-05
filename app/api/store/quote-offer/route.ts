import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { estimateId, offeredPrice } = body;

        if (!estimateId || offeredPrice === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const estimate = await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: { service: true, project: true }
        });

        if (!estimate) {
            return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
        }

        // Only allow offers if the service is STARTING_AT and the status is still draft
        if ((estimate.service as Record<string, unknown>)?.priceType !== "STARTING_AT") {
            return NextResponse.json({ error: "This service does not accept custom offers" }, { status: 400 });
        }

        if (estimate.status !== "draft") {
            return NextResponse.json({ error: "Offer already submitted or processed" }, { status: 400 });
        }

        // Update the estimate
        await prisma.estimate.update({
            where: { id: estimateId },
            data: {
                totalCost: Number(offeredPrice),
                status: "pending_offer", // Status specific for waiting admin approval on quote
            }
        });

        // Also update project status to reflect negotiation
        if (estimate.project?.id) {
            await prisma.project.update({
                where: { id: estimate.project.id },
                data: {
                    status: "pending_offer"
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Offer submitted successfully!"
        });

    } catch (error) {
        console.error("Submit Quote Offer Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
