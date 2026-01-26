"use server";

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function verifyAndSaveKey(key: string, label: string, modelId: string) {

    // 1. Validate Connection
    try {
        const targetModel = modelId || "gemini-1.5-flash";
        console.log(`Verifying key with model: ${targetModel}`);

        const tempAI = genkit({
            plugins: [googleAI({ apiKey: key })],
            model: `googleai/${targetModel}`,
        });

        // Simple prompt to test auth
        await tempAI.generate("Hi");
    } catch (error: unknown) {
        console.error("Verification Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Verification Failed: ${message}`);
    }

    // 2. Save if valid
    await prisma.systemKey.create({
        data: {
            key,
            label: label || "Unnamed Key",
            provider: "google",
            modelId: modelId || null,
        },
    });

    revalidatePath("/dashboard/admin/keys");
    return { success: true };
}
