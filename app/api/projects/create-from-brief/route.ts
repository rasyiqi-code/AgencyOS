import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createFromBriefSchema = z.object({
    title: z.string().min(1, "Title is required"),
    brief: z.string().min(1, "Brief is required"),
});

export async function POST(request: Request) {
    const user = await stackServerApp.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await request.json();
        const body = createFromBriefSchema.parse(json);

        // Create Project with spec
        const project = await prisma.project.create({
            data: {
                userId: user.id,
                title: body.title,
                description: "Project started from AI Consultation",
                spec: body.brief,
                status: "queue", // Or 'draft' if we had that status, but 'queue' is default
                briefs: {
                    create: {
                        content: body.brief,
                    },
                },
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        console.error("Project creation error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
