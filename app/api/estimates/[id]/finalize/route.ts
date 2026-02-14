
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { stackServerApp } from "@/lib/config/stack";

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

        // Parse body — selected items dari EstimateViewer (opsional untuk backward compat)
        let selectedScreens = estimate.screens;
        let selectedApis = estimate.apis;
        let finalTotalHours = estimate.totalHours;
        let finalTotalCost = estimate.totalCost;

        try {
            const body = await req.json();
            if (body.selectedScreens) selectedScreens = body.selectedScreens;
            if (body.selectedApis) selectedApis = body.selectedApis;
            if (typeof body.totalHours === 'number') finalTotalHours = body.totalHours;
            if (typeof body.totalCost === 'number') finalTotalCost = body.totalCost;
        } catch {
            // Body kosong = pakai data asli estimate (backward compatibility)
        }

        // Update Estimate dengan data yang dipilih user + status
        await prisma.estimate.update({
            where: { id: estimateId },
            data: {
                status: "pending_payment",
                screens: selectedScreens as unknown as Prisma.InputJsonValue,
                apis: selectedApis as unknown as Prisma.InputJsonValue,
                totalHours: finalTotalHours,
                totalCost: finalTotalCost,
            }
        });

        // Create Project if not exists (upsert) — gunakan data yang sudah difilter
        await prisma.project.upsert({
            where: { estimateId: estimateId },
            update: {},
            create: {
                userId: user.id || "unknown-user",
                clientName: user.displayName || user.primaryEmail || "Client",
                title: estimate.title,
                description: estimate.summary,
                spec: JSON.stringify({ screens: selectedScreens, apis: selectedApis }, null, 2),
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
