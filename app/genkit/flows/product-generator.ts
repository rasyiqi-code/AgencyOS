import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

export const productGeneratorFlow = ai.defineFlow(
    {
        name: 'productGeneratorFlow',
        inputSchema: z.string(),
        outputSchema: z.object({
            name: z.string(),
            name_id: z.string(),
            description: z.string(),
            description_id: z.string(),
            slug: z.string(),
            recommended_price: z.number(),
        }),
    },
    async (prompt) => {
        const { apiKey, model } = await getActiveAIConfig();

        // Set dynamic API key for this request execution
        process.env.GOOGLE_GENAI_API_KEY = apiKey;

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            prompt: `
            You are an expert product manager and copywriter for a software agency.
            Your task is to generate details for a digital product (plugin/template) based on a rough description.

            Input Idea: "${prompt}"

            REQUIREMENTS:
            1. Generate content in TWO languages: English (en) and Indonesian (id).
            2. Name/name_id: Professional, catchy, and descriptive.
            3. Slug: Clean URL-friendly slug based on the English name (lowercase, hyphens).
            4. Description/description_id: Comprehensive, minimal 2 paragraphs. 
               STRICTLY PLAIN TEXT ONLY. NO HTML TAGS (no <p>, no <strong>, no <ul>, etc.).
               Use double newlines for paragraph breaks.
            5. Recommended Price: A realistic price in USD (e.g., 9.99, 19.00, 49.00).

            Return strictly valid JSON matching the schema.
            `,
            output: {
                schema: z.object({
                    name: z.string(),
                    name_id: z.string(),
                    description: z.string(),
                    description_id: z.string(),
                    slug: z.string(),
                    recommended_price: z.number(),
                })
            }
        });

        if (!output) {
            throw new Error("Failed to generate product content");
        }
        return output;
    }
);
