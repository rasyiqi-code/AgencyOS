
import { estimateFlow } from '@/app/genkit';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

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
                    status: 'draft'
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
                totalCost: result.totalCost
            }
        });

        return NextResponse.json({ id: estimate.id });
    } catch (error: unknown) {
        console.error("Estimate generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate estimate";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
