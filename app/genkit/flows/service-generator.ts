import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

export const serviceGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceGeneratorFlow',
        inputSchema: z.string(),
        outputSchema: z.object({
            title: z.string(),
            description: z.string(),
            features: z.array(z.string()),
            title_id: z.string(),
            description_id: z.string(),
            features_id: z.array(z.string()),
            recommended_price: z.number(),
            priceType: z.enum(['FIXED', 'STARTING_AT']),
            currency: z.enum(['USD', 'IDR']),
            interval: z.enum(['one_time', 'monthly', 'yearly']),
            addons: z.array(z.object({
                name: z.string(),
                price: z.number(),
                interval: z.enum(['one_time', 'monthly', 'yearly']),
                currency: z.enum(['USD', 'IDR'])
            })),
            addons_id: z.array(z.object({
                name: z.string(),
                price: z.number(),
                interval: z.enum(['one_time', 'monthly', 'yearly']),
                currency: z.enum(['USD', 'IDR'])
            }))
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
            3. Description Field ("description" & "description_id"): 
               - Must be highly engaging, persuasive, and SEO-Friendly. 
               - Write a minimum of 2 paragraphs. 
               - Use HTML formatting (<p>, <ul>, <li>, <strong>).
            4. Features & Deliverables Field ("features" & "features_id"):
               - Include and expand on every single feature mentioned by the user.
               - Brainstorm 8-12 comprehensive, high-value features expected for this service to show maximum value.
               - Be specific and technical where appropriate (e.g., SEO optimization, responsive design, API integration, security layers).
            5. Pricing:
               - priceType: "FIXED" or "STARTING_AT".
               - currency: "USD" or "IDR". 
               - CRITICAL PRICE LOGIC: 
                 * If the user input is in Indonesian or mentions "Rp", "Rupiah", "Juta", or large numbers (> 10000), YOU MUST set currency to "IDR".
                 * If currency is "IDR", the price should be a realistic Indonesian price (e.g., 5.000.000 or 15.000.000).
                 * If currency is "USD", the price should be a realistic global price (e.g., 500 or 2500).
                 * NEVER mix large Indonesian numbers with USD currency.
               - interval: "one_time", "monthly", or "yearly".
               - CRITICAL INTERVAL & ADD-ON LOGIC:
                 * If priceType is "STARTING_AT": interval MUST be "one_time". You MUST generate 2-3 logical add-ons.
                 * If priceType is "FIXED": interval can be "one_time", "monthly", or "yearly". You MUST NOT generate any add-ons (set "addons" and "addons_id" to empty array []).
               - recommended_price: Generate a realistic base price matching the selected currency.
            6. Add-ons ("addons" & "addons_id"):
               - For STARTING_AT services, brainstorm 3-5 logical, high-value upsell options.
               - CRITICAL ADD-ON PRICING LOGIC: 
                 * Add-on prices MUST be realistic and proportional to the base price.
                 * Usually, an add-on should be between 5% to 25% of the "recommended_price".
                 * NEVER make an add-on more expensive than 50% of the base price unless it's a major upgrade.
               - Each addon has: name, price, interval (one_time/monthly/yearly), currency (MUST match the main service currency).
               - "addons_id" MUST be the Indonesian translation of the exact same addons.

            CRITICAL: All "_id" fields must contain human-readable Indonesian text.
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
                    priceType: z.enum(['FIXED', 'STARTING_AT']),
                    currency: z.enum(['USD', 'IDR']),
                    interval: z.enum(['one_time', 'monthly', 'yearly']),
                    addons: z.array(z.object({
                        name: z.string(),
                        price: z.number(),
                        interval: z.enum(['one_time', 'monthly', 'yearly']),
                        currency: z.enum(['USD', 'IDR'])
                    })),
                    addons_id: z.array(z.object({
                        name: z.string(),
                        price: z.number(),
                        interval: z.enum(['one_time', 'monthly', 'yearly']),
                        currency: z.enum(['USD', 'IDR'])
                    }))
                })
            }
        });

        if (!output) {
            throw new Error("Failed to generate service content");
        }
        return output;
    }
);

