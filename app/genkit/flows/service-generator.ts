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
            Your task is to generate a comprehensive service offering based on a rough description provided by the user.

            Input Description: "${prompt}"

            REQUIREMENTS:
            1. Language: Generate content in TWO languages: English and Indonesian (Bahasa Indonesia).
            2. Title Field ("title" & "title_id"): 
               - The title MUST represent the Package Name.
               - IMPORTANT: The name MUST explicitly mention the type of website/service (e.g., "Company Profile Website Package", "Enterprise E-Commerce Website", "Dealer Website Starter", "Website Toko Online").
               - Ensure "title_id" is the ACTUAL Indonesian translation (real words, NOT a key name like "title_id").
            3. Description Field ("description" & "description_id"): 
               - Must be highly engaging, persuasive, and SEO-Friendly. 
               - Write a minimum of 2 paragraphs. 
               - Use HTML formatting (<p>, <ul>, <li>, <strong>) to make it easy to read. 
               - Ensure "description_id" is the ACTUAL Indonesian translation (proper Bahasa Indonesia sentences, NOT a key name).
            4. Features & Deliverables Field ("features" & "features_id"):
               - DILARANG MENGHAPUS (CRITICAL): You MUST include and retain every single feature or deliverable mentioned by the user in the Input Description. Do not omit anything they asked for.
               - DETAILED & COMPLETE: Expand on the user's points professionally to make them sound like high-value deliverables.
               - BRAINSTORMING: If the user's input is very short or lacks detail (e.g., "bikin web dealer"), you MUST brainstorm and add standard, comprehensive features expected for that type of service (e.g., "Mobile Responsive Design, SEO Setup, WhatsApp Integration, Admin Dashboard, Contact Form, 1 Year Domain & Hosting").
               - The "features_id" array must contain the ACTUAL Indonesian translation of each feature.
            5. Recommended Price: If the user provides a price in their input, YOU MUST use that exact price (converted to a clean number). If they do not provide a price, generate a realistic base price in USD for this service (assuming high-quality agency work).

            CRITICAL: All "_id" fields must contain human-readable Indonesian text, NOT variable names, key identifiers, or camelCase strings.
            Example of WRONG output: { "title_id": "boardingHouseWebsite_title_id" }
            Example of CORRECT output: { "title_id": "Website Manajemen Kos Premium" }

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
