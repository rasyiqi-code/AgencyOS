import { prisma } from '@/lib/config/db';
import { unstable_cache } from '@/lib/cache';
import { genkit } from 'genkit';

import { googleAI } from '@genkit-ai/googleai';

/**
 * Fetch the active key and model from DB dynamically.
 */
export const ai = genkit({
    plugins: [googleAI({ apiKey: false })], // Expect apiKey at call time
});

// OPTIMASI M2: Menyederhanakan caching dengan langsung menggunakan unstable_cache bawaan Next.js, menghapus in-flight Map redundant yang boros memori.

export const isAIConfigured = unstable_cache(
    async () => {
        try {
            const key = await prisma.systemKey.findFirst({
                where: { isActive: true, provider: 'google' }
            });
            return !!key;
        } catch {
            return false;
        }
    },
    ["is-ai-configured"],
    { tags: ["system-keys"], revalidate: 3600 }
);

export const getActiveAIConfig = unstable_cache(
    async () => {
        const key = await prisma.systemKey.findFirst({
            where: { isActive: true, provider: 'google' }
        });

        if (!key) throw new Error("AI is not configured.");

        return {
            apiKey: key.key,
            model: key.modelId || 'gemini-1.5-flash'
        };
    },
    ["active-ai-config"],
    { tags: ["system-keys"], revalidate: 3600 }
);
