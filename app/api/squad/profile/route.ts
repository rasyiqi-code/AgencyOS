import { NextRequest, NextResponse } from "next/server";
import { squadService } from "@/lib/server/squad";
import { stackServerApp } from "@/lib/config/stack";

// Squad API Route
// This mirrors the functionality of Server Actions but via standard REST API
// Useful for external integrations or mobile apps.

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();

    // Basic Auth Check (Example)
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Determine action based on 'action' field or structured path
        // For simplicity in this example, we handle profile creation at root POST

        const profile = await squadService.createProfile({
            userId: user.id,
            ...body
        });

        return NextResponse.json({ success: true, data: profile });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    // Auth check: hanya user login yang boleh query profil squad
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    try {
        const profile = await squadService.getProfile(userId);
        return NextResponse.json({ success: true, data: profile });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    const user = await stackServerApp.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Ensure user can only update their own profile
        const profile = await squadService.getProfile(user.id);
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const updatedProfile = await squadService.updateProfile(user.id, body);

        return NextResponse.json({ success: true, data: updatedProfile });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update profile" },
            { status: 500 }
        );
    }
}
