import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
});

export async function POST(request: Request) {
    const user = await stackServerApp.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await request.json();
        const body = createProjectSchema.parse(json);

        // Create Project and Initial Brief in one transaction
        const project = await prisma.project.create({
            data: {
                userId: user.id,
                title: body.title,
                description: body.description,
                briefs: {
                    create: {
                        content: body.description,
                    },
                },
            },
            include: {
                briefs: true, // Return the brief just in case
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
