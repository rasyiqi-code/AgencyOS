
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProjectSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    repoUrl: z.string().optional().nullable(),
    repoOwner: z.string().optional().nullable(),
    repoName: z.string().optional().nullable(),
    deployUrl: z.string().optional().nullable(),
    developerId: z.string().optional().nullable(),
    previewUrl: z.string().optional().nullable(),
    files: z.any().optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    try {
        const json = await request.json();
        const body = updateProjectSchema.parse(json);

        const project = await prisma.project.update({
            where: { id: projectId },
            data: body,
        });

        return NextResponse.json(project);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        console.error("Project update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
