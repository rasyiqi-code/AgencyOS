import { prisma } from '@/lib/db';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Fetch the active key and model from DB once at module load (Startup).
 */
const config = await (async () => {
    try {
        const key = await prisma.systemKey.findFirst({
            where: { isActive: true, provider: 'google' }
        });
        if (!key) {
            console.warn("AI: No active API key found in database.");
            return { key: null, model: 'gemini-1.5-flash' };
        }
        return {
            key: key.key,
            model: key.modelId || 'gemini-1.5-flash'
        };
    } catch {
        console.warn("AI: Database error at startup.");
        return { key: null, model: 'gemini-1.5-flash' };
    }
})();

export const ai = genkit({
    plugins: [googleAI({ apiKey: config.key || 'MISSING_KEY' })],
    model: `googleai/${config.model}`, // Set default model
});

/**
 * Helper to check AI availability.
 */
export function isAIConfigured() {
    return !!config.key;
}

export async function getActiveAIConfig() {
    if (!config.key) throw new Error("AI is not configured.");
    return { apiKey: config.key, model: config.model };
}
