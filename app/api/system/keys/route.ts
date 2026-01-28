
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { key, label, modelId } = body;

        // 1. Validate Connection
        try {
            const targetModel = modelId || "gemini-1.5-flash";
            const tempAI = genkit({
                plugins: [googleAI({ apiKey: key })],
                model: `googleai/${targetModel}`,
            });
            await tempAI.generate("Hi");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return NextResponse.json({ error: `Verification Failed: ${message}` }, { status: 400 });
        }

        // 2. Save
        await prisma.systemKey.create({
            data: {
                key,
                label: label || "Unnamed Key",
                provider: "google",
                modelId: modelId || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("System Keys API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
