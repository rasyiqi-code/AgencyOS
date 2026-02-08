
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { missionId } = body;



        const project = await prisma.project.findUnique({
            where: { id: missionId },
            include: { service: true }
        });

        if (!project || project.developerId !== user.id) {
            return NextResponse.json({ error: "Unauthorized or mission not found" }, { status: 401 });
        }

        if (project.status === 'done') {
            return NextResponse.json({ error: "Mission already completed" }, { status: 400 });
        }

        // Mark as completed - In a real system, this would trigger an admin review.
        // For this demo/setup, we'll mark it as done and add to earnings.
        // Mark as completed
        const updatedProject = await prisma.project.update({
            where: { id: missionId },
            data: { status: 'done' }
        });

        // (Optional) Here we could trigger a notification to the Admin/PM

        return NextResponse.json({ success: true, project: updatedProject });

        return NextResponse.json({ success: true, project: updatedProject });

    } catch (error) {
        console.error("Complete mission error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
