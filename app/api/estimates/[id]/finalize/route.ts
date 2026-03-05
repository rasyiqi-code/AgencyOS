
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
        // NOTE: Project TIDAK dibuat di sini.
        // Project dibuat di checkout/route.ts saat user benar-benar masuk
        // ke halaman checkout, agar entry tidak muncul di admin orders
        // sebelum ada transaksi nyata.
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

        return NextResponse.json({ url: `/checkout/${estimateId}` });
    } catch (error) {
        console.error("Finalize Estimate Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
