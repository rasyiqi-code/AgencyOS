import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Resolve Users for Name-based Search
    let matchedUserIds: string[] = [];
    const isUUID = query && /^[0-9a-fA-F-]{36}$/.test(query);

    if (query) {
        if (isUUID) {
            matchedUserIds = [query];
        } else {
            try {
                const allUsers = await stackServerApp.listUsers();
                matchedUserIds = allUsers
                    .filter((u) =>
                        (u.displayName && u.displayName.toLowerCase().includes(query.toLowerCase())) ||
                        (u.primaryEmail && u.primaryEmail.toLowerCase().includes(query.toLowerCase())) ||
                        (u.id && u.id.toLowerCase().includes(query.toLowerCase()))
                    )
                    .map((u) => u.id);
            } catch (e) {
                console.error("Search user resolution failed in getProjects", e);
            }
        }
    }

    const where = {
        AND: [
            query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' as const } },
                    { userId: { contains: query, mode: 'insensitive' as const } },
                    { userId: { equals: query } },
                    { description: { contains: query, mode: 'insensitive' as const } },
                    { status: { contains: query, mode: 'insensitive' as const } },
                    { service: { title: { contains: query, mode: 'insensitive' as const } } },
                    ...(matchedUserIds.length > 0 ? [{ userId: { in: matchedUserIds } }] : []),
                    { clientName: { contains: query, mode: 'insensitive' as const } },
                    { invoiceId: { contains: query, mode: 'insensitive' as const } },
                ]
            } : {},
            (status && status !== 'all') ? { status: { equals: status } } : {},
        ]
    };

    try {
        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            include: {
                service: true
            }
        });

        // 2. Enrich Projects with Client Names from Stack Auth
        const uniqueUserIds = Array.from(new Set(projects.map(p => p.userId).filter(Boolean)));
        const stackUsers = await Promise.all(
            uniqueUserIds.map(async (id) => {
                try {
                    return await stackServerApp.getUser(id);
                } catch (e) {
                    console.error(`Failed to fetch user ${id} in getProjects`, e);
                    return null;
                }
            })
        );
        const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u]));

        const enrichedProjects = projects.map((p) => {
            if (p.clientName) return p;
            const u = userMap.get(p.userId);
            return {
                ...p,
                clientName: u?.displayName || u?.primaryEmail || "Unnamed Client"
            };
        });

        return NextResponse.json(enrichedProjects);
    } catch (error) {
        console.error("Get Projects Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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
