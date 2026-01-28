
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const { projectId, content, type, imageUrl } = await req.json();

        if (!projectId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                projectId,
                content,
                type: type || 'bug',
                imageUrl,
                status: 'open'
            }
        });

        revalidatePath(`/dashboard/${projectId}`);
        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error creating feedback:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, status, projectId } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newStatus = status === 'open' ? 'resolved' : 'open';

        const feedback = await prisma.feedback.update({
            where: { id },
            data: { status: newStatus }
        });

        if (projectId) {
            revalidatePath(`/dashboard/${projectId}`);
        }

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error updating feedback:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
