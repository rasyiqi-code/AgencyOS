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
        let { apiKey, model } = await getActiveAIConfig();

        // Set dynamic API key for this request execution
        process.env.GOOGLE_GENAI_API_KEY = apiKey;

        console.log(`Executing serviceGeneratorFlow with model: ${model}`);

        // Step 1: Market Research with Grounding
        // We do this separately because grounding doesn't support JSON output mode yet
        let marketResearch = "No specific market research data available (Grounding skipped or failed).";

        try {
            const researchResult = await ai.generate({
                model: `googleai/${model}`,
                config: {
                    googleSearchRetrieval: true,
                },
                prompt: `
                Perform a quick market research to find the latest pricing for agency services related to: "${prompt}".
                Find typical rates for small, medium, and large agencies in 2024-2025.
                Focus on USD prices.
                `
            });
            marketResearch = researchResult.text;
        } catch (error: any) {
            console.warn("Market Research Grounding failed. Continuing with internal knowledge.", error?.message);
        }

        // Step 2: Structured Generation
        const { output } = await ai.generate({
            model: `googleai/${model}`,
            prompt: `
            You are an expert product manager and copywriter for a software development agency.
            Your task is to generate a comprehensive service offering based on a rough description.

            Input Description: "${prompt}"

            MARKET RESEARCH DATA:
            ${marketResearch}

            REQUIREMENTS:
            1. Generate content in TWO languages: English (en) and Indonesian (id).
            2. Title: Professional, catchy, enterprise-grade.
            3. Description: minimal 2 paragraphs, HTML format (use <p>, <ul>, <li>, <strong>). Persuasive copy.
            4. Features: 4-6 key selling points. Short and impactful.
            5. Recommended Price: A realistic base price in USD for this service, grounded in the provided MARKET RESEARCH DATA and assuming a premium agency quality.

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
