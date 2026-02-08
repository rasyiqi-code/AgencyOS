
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: missionId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!['accept', 'reject'].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    try {
        const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
        });

        if (!squadProfile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const application = await prisma.missionApplication.findUnique({
            where: {
                missionId_squadId: {
                    missionId,
                    squadId: squadProfile.id
                }
            }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.status !== 'invited') {
            return NextResponse.json({ error: "Application is not in invited state" }, { status: 400 });
        }

        if (action === 'accept') {
            await prisma.missionApplication.update({
                where: {
                    missionId_squadId: {
                        missionId,
                        squadId: squadProfile.id
                    }
                },
                data: { status: 'accepted' }
            });
        } else if (action === 'reject') {
            // Hard delete for rejection to keep things clean, can be soft delete if history needed later
            await prisma.missionApplication.delete({
                where: {
                    missionId_squadId: {
                        missionId,
                        squadId: squadProfile.id
                    }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Invitation response error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
