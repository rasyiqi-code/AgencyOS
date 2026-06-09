"use server";

import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function getAgencyKeys() {
    if (!await isAdmin()) return [];
    return await prisma.systemKey.findMany({
        where: { provider: "agency-os" },
        orderBy: { createdAt: "desc" }
    });
}

export async function createAgencyKey(label: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    // Generate a secure API Key: gos_...
    const key = `gos_${randomBytes(32).toString('hex')}`;
    
    const newKey = await prisma.systemKey.create({
        data: {
            key,
            provider: "agency-os",
            label,
            isActive: true
        }
    });

    revalidatePath("/admin/system/keys");
    return newKey;
}

export async function toggleAgencyKey(id: string, isActive: boolean) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    await prisma.systemKey.update({
        where: { id },
        data: { isActive }
    });

    revalidatePath("/admin/system/keys");
}

export async function deleteAgencyKey(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    await prisma.systemKey.delete({
        where: { id }
    });

    revalidatePath("/admin/system/keys");
}

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
