import { prisma } from '@/lib/config/db';
import { unstable_cache } from 'next/cache';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Fetch the active key and model from DB dynamically.
 */
export const ai = genkit({
    plugins: [googleAI({ apiKey: false })], // Expect apiKey at call time
});

const inFlightAIRequests = new Map<string, Promise<any>>();

/**
 * Helper to check AI availability.
 */
export const isAIConfigured = async () => {
    const cacheKey = "is-ai-configured";
    if (inFlightAIRequests.has(cacheKey)) return inFlightAIRequests.get(cacheKey)!;

    const request = (async () => {
        return unstable_cache(
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
            [cacheKey],
            { tags: ["system-keys"], revalidate: 3600 }
        )();
    })();

    inFlightAIRequests.set(cacheKey, request);
    try {
        return await request;
    } finally {
        inFlightAIRequests.delete(cacheKey);
    }
};

export const getActiveAIConfig = async () => {
    const cacheKey = "active-ai-config";
    if (inFlightAIRequests.has(cacheKey)) return inFlightAIRequests.get(cacheKey)!;

    const request = (async () => {
        return unstable_cache(
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
            [cacheKey],
            { tags: ["system-keys"], revalidate: 3600 }
        )();
    })();

    inFlightAIRequests.set(cacheKey, request);
    try {
        return await request;
    } finally {
        inFlightAIRequests.delete(cacheKey);
    }
};
