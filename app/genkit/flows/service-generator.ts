import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

export const serviceGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceGeneratorFlow',
        inputSchema: z.string(),
        outputSchema: z.object({
            title: z.string(),
            description: z.string(), // HTML/RichText allowed
            features: z.array(z.string()),
            title_id: z.string(),
            description_id: z.string(), // HTML/RichText allowed
            features_id: z.array(z.string()),
            recommended_price: z.number(),
        }),
    },
    async (prompt) => {
        const { apiKey, model } = await getActiveAIConfig();

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { apiKey },
            prompt: `
            You are an expert product manager and copywriter for a software development agency.
            Your task is to generate a comprehensive service offering based on a rough description.

            Input Description: "${prompt}"

            REQUIREMENTS:
            1. Generate content in TWO languages: English and Indonesian (Bahasa Indonesia).
            2. The "title" field must contain the English title. The "title_id" field must contain the ACTUAL Indonesian translation of the title (real Indonesian words, NOT a key name or camelCase identifier).
            3. The "description" field must contain the English description. The "description_id" field must contain the ACTUAL Indonesian translation (real Indonesian sentences in proper Bahasa Indonesia, NOT a key name or camelCase identifier).
            4. The "features" array must contain English feature strings. The "features_id" array must contain the ACTUAL Indonesian translation of each feature (real Indonesian words, NOT key names).
            5. Title: Professional, catchy, enterprise-grade.
            6. Description: minimal 2 paragraphs, HTML format (use <p>, <ul>, <li>, <strong>). Persuasive copy.
            7. Features: 4-6 key selling points. Short and impactful.
            8. Recommended Price: A realistic base price in USD for this service (assuming agency quality).

            CRITICAL: All "_id" fields must contain human-readable Indonesian text, NOT variable names, key identifiers, or camelCase strings.
            Example of WRONG output: { "title_id": "boardingHouseWebsite_title_id" }
            Example of CORRECT output: { "title_id": "Website Manajemen Rumah Kos Premium" }

            Return strictly valid JSON matching the schema.
            `,
            output: {
                schema: z.object({
                    title: z.string(),
                    description: z.string(),
                    features: z.array(z.string()),
                    title_id: z.string(),
                    description_id: z.string(),
                    features_id: z.array(z.string()),
                    recommended_price: z.number(),
                })
            }
        });

        if (!output) {
            throw new Error("Failed to generate service content");
        }
        return output;
    }
);
