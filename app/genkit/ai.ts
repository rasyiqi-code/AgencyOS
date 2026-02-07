import { prisma } from '@/lib/config/db';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Fetch the active key and model from DB dynamically.
 */
export const ai = genkit({
    plugins: [googleAI()], // Rely on GOOGLE_GENAI_API_KEY set at runtime
});

/**
 * Helper to check AI availability.
 */
export async function isAIConfigured() {
    try {
        const key = await prisma.systemKey.findFirst({
            where: { isActive: true, provider: 'google' }
        });
        return !!key;
    } catch {
        return false;
    }
}

export async function getActiveAIConfig() {
    const key = await prisma.systemKey.findFirst({
        where: { isActive: true, provider: 'google' }
    });

    if (!key) throw new Error("AI is not configured.");

    return {
        apiKey: key.key,
        model: key.modelId || 'gemini-1.5-flash'
    };
}
