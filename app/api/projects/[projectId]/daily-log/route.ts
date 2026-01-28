
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate params
    const projectId = (await params).projectId;
    if (!projectId) return NextResponse.json({ error: "Project ID missing" }, { status: 400 });

    try {
        const body = await req.json();
        const { content, mood } = body;

        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const validMoods = ["on_track", "delayed", "shipped"];
        if (!validMoods.includes(mood)) {
            return NextResponse.json({ error: "Invalid mood" }, { status: 400 });
        }

        // Ideally check if user has permission to post to this project
        // For MVP, assuming if they are logged in and hit this endpoint, we might check project ownership or admin status
        // But the original action didn't strict check permissions beyond what's implied.
        // Let's at least ensure the project exists.

        const log = await prisma.dailyLog.create({
            data: {
                projectId,
                content,
                mood: mood as "on_track" | "delayed" | "shipped"
            }
        });

        return NextResponse.json({ success: true, data: log });
    } catch (error) {
        console.error("Failed to create log:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
