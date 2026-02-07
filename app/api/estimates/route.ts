import { estimateFlow } from '@/app/genkit';
import { prisma } from '@/lib/config/db';
import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/shared/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '2');
        const cursor = searchParams.get('cursor');

        const estimates = await prisma.estimate.findMany({
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                totalHours: true,
                totalCost: true,
                createdAt: true,
                complexity: true,
                creatorName: true
            }
        });

        // Determine next cursor
        const nextCursor = estimates.length === limit ? estimates[estimates.length - 1].id : undefined;

        return NextResponse.json({
            items: estimates,
            nextCursor
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch estimates" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.estimate.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete estimate" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await getCurrentUser();
        const userId = user?.id;
        const creatorName = user?.displayName || user?.primaryEmail?.split('@')[0] || "Anonymous";

        // Manual Mode (from Calculator/Human)
        if (body.type === 'manual') {
            const { title, summary, complexity, screens, apis, totalHours, totalCost, prompt } = body.data;

            const estimate = await prisma.estimate.create({
                data: {
                    prompt: prompt || "Manual Estimate",
                    title,
                    summary,
                    complexity,
                    screens,
                    apis,
                    totalHours,
                    totalCost,
                    status: 'draft',
                    userId,
                    creatorName
                }
            });
            return NextResponse.json({ id: estimate.id });
        }

        // AI Mode (Genkit)
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Run Genkit Flow
        const result = await estimateFlow(prompt);

        // Save to DB
        const estimate = await prisma.estimate.create({
            data: {
                prompt,
                title: result.title,
                summary: result.summary,
                complexity: result.complexity,
                screens: result.screens,
                apis: result.apis,
                totalHours: result.totalHours,
                totalCost: result.totalCost,
                userId,
                creatorName
            }
        });

        return NextResponse.json({ id: estimate.id });
    } catch (error: unknown) {
        console.error("Estimate generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate estimate";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
