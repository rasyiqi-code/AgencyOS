import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { missionId } = body;

        if (!missionId) {
            return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
        }

        const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
        });

        if (!squadProfile) {
            return NextResponse.json({ error: "Squad profile not found" }, { status: 404 });
        }

        // Pastikan project/mission ada dan statusnya 'queue' (tersedia untuk diklaim)
        const mission = await prisma.project.findUnique({
            where: { id: missionId }
        });

        if (!mission) {
            return NextResponse.json({ error: "Mission not found" }, { status: 404 });
        }

        if (mission.status !== 'queue') {
            return NextResponse.json({ error: "Mission is not available for claim" }, { status: 400 });
        }

        // Cek apakah sudah pernah mengajukan lamaran untuk misi ini
        const existingApplication = await prisma.missionApplication.findUnique({
            where: {
                missionId_squadId: {
                    missionId,
                    squadId: squadProfile.id
                }
            }
        });

        if (existingApplication) {
            return NextResponse.json({ error: "You have already applied for this mission" }, { status: 400 });
        }

        // Buat aplikasi misi baru dengan status default 'pending'
        const application = await prisma.missionApplication.create({
            data: {
                missionId,
                squadId: squadProfile.id,
                status: "pending"
            }
        });

        return NextResponse.json({ success: true, application });
    } catch (error) {
        console.error("Mission application error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
