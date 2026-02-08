
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
    bounty: z.number().optional().nullable(),
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

        // Separate developerId from other updates to handle invitation flow
        const { developerId, ...otherUpdates } = body;

        const project = await prisma.$transaction(async (tx) => {
            const updated = await tx.project.update({
                where: { id: projectId },
                data: otherUpdates,
            });

            // If developerId is set (assignment attempted), create invitation
            if (developerId) {
                const squadProfile = await tx.squadProfile.findUnique({
                    where: { userId: developerId }
                });

                if (squadProfile) {
                    // Check if already applied or invited
                    const existingApp = await tx.missionApplication.findFirst({
                        where: {
                            missionId: projectId,
                            squadId: squadProfile.id
                        }
                    });

                    if (!existingApp) {
                        await tx.missionApplication.create({
                            data: {
                                missionId: projectId,
                                squadId: squadProfile.id,
                                status: "invited", // Changed from "accepted"
                            }
                        });

                        // Notify Developer
                        await tx.notification.create({
                            data: {
                                userId: developerId,
                                title: "New Mission Invitation",
                                content: `You have been invited to join mission: ${updated.title || 'Untitled Project'}. Check your Squad Dashboard to accept.`,
                                link: "/squad",
                                type: "invitation"
                            }
                        });

                    } else if (existingApp.status !== "accepted" && existingApp.status !== "invited") {
                        // Re-invite if previously rejected or pending
                        await tx.missionApplication.update({
                            where: { id: existingApp.id },
                            data: { status: "invited" }
                        });

                        // Notify (Duplicate check omitted for brevity, but good practice)
                        await tx.notification.create({
                            data: {
                                userId: developerId,
                                title: "Mission Invitation Updated",
                                content: `You have a pending invitation for mission: ${updated.title || 'Untitled Project'}.`,
                                link: "/squad",
                                type: "invitation"
                            }
                        });
                    }
                }
            }

            return updated;
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
