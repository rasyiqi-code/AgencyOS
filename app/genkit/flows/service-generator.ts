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

        // Set dynamic API key for this request execution
        process.env.GOOGLE_GENAI_API_KEY = apiKey;

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            prompt: `
            You are an expert product manager and copywriter for a software development agency.
            Your task is to generate a comprehensive service offering based on a rough description.

            Input Description: "${prompt}"

            REQUIREMENTS:
            1. Generate content in TWO languages: English (en) and Indonesian (id).
            2. Title: Professional, catchy, enterprise-grade.
            3. Description: minimal 2 paragraphs, HTML format (use <p>, <ul>, <li>, <strong>). Persuasive copy.
            4. Features: 4-6 key selling points. Short and impactful.
            5. Recommended Price: A realistic base price in USD for this service (assuming agency quality).

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
