
import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: Request) {
    // Auth check: hanya admin yang boleh trigger deployment
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { deployUrl: true }
        });

        if (!project || !project.deployUrl) {
            return NextResponse.json({ error: "Deploy Hook not configured for this project." }, { status: 404 });
        }

        // Trigger Vercel Webhook
        const res = await fetch(project.deployUrl, { method: 'POST' });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to trigger deployment at Vercel." }, { status: 502 });
        }

        return NextResponse.json({ success: true, message: "Deployment triggered successfully!" });
    } catch (error) {
        console.error("Deploy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
