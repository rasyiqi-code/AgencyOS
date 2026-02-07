
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/integrations/storage";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 1. Upload to R2
        const filename = `projects/${projectId}/docs/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const url = await uploadFile(file, filename);

        if (!url || (!url.startsWith("http") && !url.startsWith("/"))) {
            throw new Error("Failed to upload to R2");
        }

        // 2. Fetch current files
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { files: true }
        });

        const currentFiles = (project?.files as unknown as { name: string; url: string; type: string; uploadedAt: string }[]) || [];

        // 3. Append new file
        const newFile = {
            name: file.name,
            url: url,
            type: file.type,
            uploadedAt: new Date().toISOString()
        };

        const updatedFiles = [...currentFiles, newFile];

        // 4. Update project
        await prisma.project.update({
            where: { id: projectId },
            data: { files: updatedFiles }
        });

        return NextResponse.json({ success: true, file: newFile });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Project file upload error:", message);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
