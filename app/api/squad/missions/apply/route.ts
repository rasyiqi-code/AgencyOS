import { NextRequest, NextResponse } from "next/server";
import { squadService } from "@/lib/server/squad";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { missionId, coverLetter, proposedRate } = body;

        if (!missionId) {
            return NextResponse.json({ error: "Mission ID is required" }, { status: 400 });
        }

        const profile = await squadService.getProfile(user.id);
        if (!profile) {
            return NextResponse.json({ error: "Squad profile not found" }, { status: 404 });
        }

        await squadService.applyForMission({
            missionId,
            squadId: profile.id,
            coverLetter,
            proposedRate
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to apply" },
            { status: 500 }
        );
    }
}
