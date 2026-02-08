
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ projectId: string; squadId: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, squadId } = await params;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Delete the application
            await tx.missionApplication.delete({
                where: {
                    missionId_squadId: {
                        missionId: projectId,
                        squadId: squadId
                    }
                }
            });

            // 2. If this user was the "primary" developerId (legacy support), clear it
            // We need to check if the project current developerId matches the user of this squad profile
            const squadProfile = await tx.squadProfile.findUnique({
                where: { id: squadId }
            });

            if (squadProfile) {
                const project = await tx.project.findUnique({
                    where: { id: projectId },
                    select: { developerId: true }
                });

                if (project?.developerId === squadProfile.userId) {
                    await tx.project.update({
                        where: { id: projectId },
                        data: { developerId: null }
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove team member error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
