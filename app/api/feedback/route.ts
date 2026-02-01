
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const projectId = formData.get('projectId') as string; // Required for Revalidation

        // Check if this is a comment (reply)
        const feedbackId = formData.get('feedbackId') as string;

        const content = formData.get('content') as string;
        const type = formData.get('type') as string;
        let imageUrl = formData.get('imageUrl') as string; // Optional: manual URL
        const file = formData.get('imageFile') as File;

        if (!content) {
            return NextResponse.json({ error: "Missing content" }, { status: 400 });
        }

        // Handle File Upload if present (Shared logic for both Feedback and Comment)
        if (file && file.size > 0 && file.name !== 'undefined') {
            try {
                const { uploadFile } = await import("@/lib/storage");
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const folder = feedbackId ? 'comments' : 'feedback';
                const path = `projects/${projectId}/${folder}/${Date.now()}-${safeName}`;
                imageUrl = await uploadFile(file, path);
            } catch (uploadError) {
                console.error("Failed to upload file:", uploadError);
                return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
            }
        }

        if (feedbackId) {
            // Create Comment
            const comment = await prisma.feedbackComment.create({
                data: {
                    feedbackId,
                    content,
                    imageUrl: imageUrl || null,
                    role: 'admin' // TODO: Dynamic role based on user session (stack auth)
                }
            });
            // Revalidate path
            if (projectId) revalidatePath(`/dashboard/${projectId}`);
            return NextResponse.json(comment);
        } else {
            // Create New Feedback
            if (!projectId) {
                return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
            }

            const feedback = await prisma.feedback.create({
                data: {
                    projectId,
                    content,
                    type: type || 'bug',
                    imageUrl: imageUrl || null,
                    status: 'open'
                }
            });

            revalidatePath(`/dashboard/${projectId}`);
            return NextResponse.json(feedback);
        }

    } catch (error) {
        console.error("Error processing feedback/comment:", error);
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
