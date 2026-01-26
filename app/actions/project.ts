"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadProjectFile(formData: FormData) {
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file || !projectId) throw new Error("Missing file or project ID");

    const { uploadFile } = await import("@/lib/storage");
    const url = await uploadFile(file, `projects/${projectId}/${Date.now()}-${file.name}`);

    // Get current files
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { files: true }
    });

    const currentFiles = (project?.files as { name: string, url: string, type: string, uploadedAt: string }[]) || [];
    const newFile = {
        name: file.name,
        url: url,
        type: file.type,
        uploadedAt: new Date().toISOString()
    };

    await prisma.project.update({
        where: { id: projectId },
        data: {
            files: [...currentFiles, newFile]
        }
    });

    revalidatePath(`/dashboard/missions/${projectId}`);
    return newFile;
}
