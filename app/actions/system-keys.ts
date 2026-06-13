"use server";

import { prisma } from "@/lib/config/db";

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
        where: { provider: { in: ["google", "nvidia"] } },
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

export async function verifyAndSaveNvidiaKey(key: string, label?: string, modelId?: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const targetModel = modelId || "google/diffusiongemma-26b-a4b-it";
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    try {
        const headers = {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
        };
        const payload = {
            model: targetModel,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 10
        };
        const res = await fetch(invokeUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Verification Failed: ${res.statusText} - ${errText}`);
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Verification Failed: ${message}`);
    }

    await prisma.systemKey.updateMany({
        where: { provider: { in: ["google", "nvidia"] } },
        data: { isActive: false },
    });

    await prisma.systemKey.upsert({
        where: { key: key },
        update: {
            label: label || "Nvidia NIM Key",
            modelId: modelId || null,
            isActive: true,
            provider: "nvidia"
        },
        create: {
            key,
            label: label || "Nvidia NIM Key",
            provider: "nvidia",
            modelId: modelId || null,
            isActive: true,
        },
    });

    revalidatePath("/admin/system/keys");
}
