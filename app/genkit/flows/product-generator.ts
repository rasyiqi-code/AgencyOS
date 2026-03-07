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

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { apiKey },
            prompt: `
            You are an expert product manager and copywriter for a software agency.
            Your task is to generate details for a digital product (plugin/template) based on a rough description.

            Input Idea: "${prompt}"

            REQUIREMENTS:
            1. Language: Generate content in TWO languages: English (en) and Indonesian (id).
            2. Name Field ("name" & "name_id"): Professional, catchy, and descriptive.
               - Ensure "name_id" is the ACTUAL Indonesian translation (real words, NOT a key name like "name_id").
            3. Slug: Clean URL-friendly slug based on the English name (lowercase, hyphens).
            4. Description Field ("description" & "description_id"): 
               - DILARANG MENGHAPUS (CRITICAL): You MUST include and retain every single feature or idea mentioned by the user in the Input Idea.
               - Build upon the user's input to make it comprehensive, minimal 2 paragraphs. 
               - STRICTLY PLAIN TEXT ONLY. NO HTML TAGS (no <p>, no <strong>, no <ul>, etc.).
               - Use double newlines for paragraph breaks.
               - Ensure "description_id" is the ACTUAL Indonesian translation (proper Bahasa Indonesia sentences, NOT a key name).
            5. Recommended Price: If the user provides a price in their input, YOU MUST use that exact price (converted to a clean number). If they do not provide a price, generate a realistic price in USD (e.g., 9.99, 19.00, 49.00).

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
