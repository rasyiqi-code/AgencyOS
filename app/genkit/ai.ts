import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { prisma } from '@/lib/db';

// Static instance (fallback)
export const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: 'googleai/gemini-flash-latest',
});

// List of models to rotate (Low latency & High RPM focus)
const MODEL_POOL = [
    'googleai/gemini-2.0-flash',      // Primary
    'googleai/gemini-1.5-flash',      // Fallback
];

/**
 * Returns a Genkit instance configured with:
 * 1. A rotated API key (Load Balancing)
 * 2. A rotated Model (Quota Distribution)
 */
export async function getDynamicAI() {
    try {
        // Fetch active keys
        const keys = await prisma.systemKey.findMany({
            where: { isActive: true, provider: 'google' }
        });

        if (keys.length > 0) {
            // 1. Rotate Key
            const randomKey = keys[Math.floor(Math.random() * keys.length)];

            // 2. Determine Model: Key Specific -> Global Setting -> Pool Rotation
            let selectedModel = randomKey.modelId;

            if (!selectedModel) {
                // Check Global Setting via Env
                selectedModel = process.env.DEFAULT_AI_MODEL || null;
            }

            if (!selectedModel) {
                selectedModel = MODEL_POOL[Math.floor(Math.random() * MODEL_POOL.length)];
            }

            // Ensure prefix exists (User might enter just "gemini-1.5-flash")
            if (selectedModel && !selectedModel.startsWith('googleai/')) {
                selectedModel = `googleai/${selectedModel}`;
            }

            // Return a new instance
            return genkit({
                plugins: [googleAI({ apiKey: randomKey.key })],
                model: selectedModel,
            });
        } else {
            console.log("AI: No active keys found in database");
        }
    } catch (error) {
        console.error("Failed to fetch dynamic keys:", error);
    }

    // Fallback
    return ai;
}
