
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const user = await stackServerApp.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const estimateId = params.id;

    try {
        const estimate = await prisma.estimate.findUnique({
            where: { id: estimateId }
        });

        if (!estimate) {
            return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
        }

        // Update Estimate Status
        await prisma.estimate.update({
            where: { id: estimateId },
            data: { status: "pending_payment" }
        });

        // Create Project if not exists (upsert)
        await prisma.project.upsert({
            where: { estimateId: estimateId },
            update: {},
            create: {
                userId: user.id || "unknown-user",
                clientName: user.displayName || user.primaryEmail || "Client",
                title: estimate.title,
                description: estimate.summary,
                spec: JSON.stringify({ screens: estimate.screens, apis: estimate.apis }, null, 2),
                status: "pending_payment",
                estimateId: estimateId,
                developerId: null,
            }
        });

        return NextResponse.json({ url: `/checkout/${estimateId}` });
    } catch (error) {
        console.error("Finalize Estimate Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
