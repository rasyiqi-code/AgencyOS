"use server";

import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { revalidatePath } from "next/cache";
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';


export async function verifyAndSaveGoogleKey(key: string, label?: string, modelId?: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const targetModel = modelId || "gemini-1.5-flash";
    try {
        const tempAI = genkit({
            plugins: [googleAI({ apiKey: key })],
            model: `googleai/${targetModel}`,
        });
        await tempAI.generate("Hi");
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Verification Failed: ${message}`);
    }

    await prisma.systemKey.updateMany({
        where: { provider: "google" },
        data: { isActive: false },
    });

    await prisma.systemKey.upsert({
        where: { key: key },
        update: {
            label: label || "Unnamed Key",
            modelId: modelId || null,
            isActive: true,
        },
        create: {
            key,
            label: label || "Unnamed Key",
            provider: "google",
            modelId: modelId || null,
            isActive: true,
        },
    });

    revalidatePath("/admin/system/keys");
}
