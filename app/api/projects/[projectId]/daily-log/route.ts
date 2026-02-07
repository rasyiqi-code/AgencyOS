
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

const validMoods = ["on_track", "delayed", "shipped"];

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ projectId: string }> }
) {
    const params = await props.params;
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projectId = params.projectId;
    if (!projectId) return NextResponse.json({ error: "Project ID missing" }, { status: 400 });

    // Permission Check
    const { isAdmin } = await import("@/lib/shared/auth-helpers");
    const isGlobalAdmin = await isAdmin();

    if (!isGlobalAdmin) {
        // Check if user is an accepted squad member
        const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
        });

        if (!squadProfile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const application = await prisma.missionApplication.findUnique({
            where: {
                missionId_squadId: {
                    missionId: projectId,
                    squadId: squadProfile.id
                }
            }
        });

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { developerId: true }
        });

        const isAssigned = project?.developerId === squadProfile.id;
        const isAccepted = application?.status === 'accepted';

        if (!isAssigned && !isAccepted) {
            return NextResponse.json({ error: "Unauthorized access to this mission" }, { status: 403 });
        }
    }

    try {
        const formData = await req.formData();
        const content = formData.get("content") as string;
        const mood = formData.get("mood") as string;
        const files = formData.getAll("images") as File[]; // Expect 'images' key for files

        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        if (!validMoods.includes(mood)) {
            return NextResponse.json({ error: "Invalid mood" }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        if (files && files.length > 0) {
            const { uploadFile } = await import("@/lib/integrations/storage");

            for (const file of files) {
                if (file.size > 0 && file.name !== 'undefined') {
                    try {
                        // sanitize filename for safety
                        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                        const path = `projects/${projectId}/daily-updates/${Date.now()}-${safeName}`;
                        const url = await uploadFile(file, path);
                        uploadedUrls.push(url);
                    } catch (uploadError) {
                        console.error("Failed to upload file:", file.name, uploadError);
                        // Continue uploading others or fail? Let's log warning and continue for now
                    }
                }
            }
        }

        const log = await prisma.dailyLog.create({
            data: {
                projectId,
                content,
                mood: mood as "on_track" | "delayed" | "shipped",
                images: uploadedUrls
            }
        });

        return NextResponse.json({ success: true, data: log });
    } catch (error) {
        console.error("Failed to create log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
