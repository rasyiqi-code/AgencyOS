import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { estimateId, status } = body;

        if (!estimateId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find project associated with this estimate
        const estimate = await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: { project: true }
        });

        if (!estimate) {
            return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
        }

        // Update Estimate and Project status
        await prisma.$transaction([
            prisma.estimate.update({
                where: { id: estimateId },
                data: { status }
            }),
            ...(estimate.project ? [
                prisma.project.update({
                    where: { id: estimate.project.id },
                    data: { status }
                })
            ] : [])
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
