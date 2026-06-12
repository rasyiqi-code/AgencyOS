import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

// OPTIMASI M3: Definisikan schema Zod sekali sebagai konstanta modul agar tidak diduplikasi di RAM
const serviceOutputSchema = z.object({
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
        name_id: z.string(),
        price: z.number(),
        interval: z.enum(['one_time', 'monthly', 'yearly']),
        currency: z.enum(['USD', 'IDR'])
    }))
});

export const serviceGeneratorFlow = ai.defineFlow(
    {
        name: 'serviceGeneratorFlow',
        inputSchema: z.string(),
        outputSchema: serviceOutputSchema,
    },
    async (prompt) => {
        const { apiKey, model } = await getActiveAIConfig();

        // Sanitize prompt to prevent basic prompt injection
        const sanitizedPrompt = prompt
            .replace(/[\\"\n\r]/g, ' ')
            .trim();

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            config: { apiKey },
            prompt: `
            You are an expert product manager and copywriter for a software development agency.
            Your task is to generate a comprehensive service offering based on a rough description provided by the user.

            Input Description: "${sanitizedPrompt}"

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
                - LOGIKA INTERVAL & ADD-ON:
                  * Pilihan interval ("one_time", "monthly", "yearly") dapat digunakan untuk kedua jenis priceType ("FIXED" dan "STARTING_AT") sesuai kebutuhan layanan tersebut.
                  * Layanan bertipe "FIXED" maupun "STARTING_AT" dapat memiliki add-ons. Silakan buat 2-4 opsi add-ons yang logis dan memberikan nilai tambah.
                - recommended_price: Generate a realistic base price matching the selected currency.
             6. Add-ons ("addons"):
                - Buat 2-4 add-ons (upsell options) yang logis dan bernilai tinggi untuk layanan tersebut.
                - LOGIKA HARGA ADD-ON: 
                  * Harga add-on harus realistis dan proporsional dengan harga dasar (recommended_price).
                  * Biasanya, harga add-on berkisar antara 5% hingga 25% dari "recommended_price".
                  * Jangan membuat add-on yang lebih mahal dari 50% harga dasar kecuali jika itu merupakan peningkatan fungsionalitas utama.
                - Setiap add-on memiliki properti: name (terjemahan Inggris), name_id (terjemahan Bahasa Indonesia), price, interval (one_time/monthly/yearly), dan currency (HARUS sama dengan mata uang utama layanan).

            CRITICAL: All "_id" fields must contain human-readable Indonesian text.
            Return strictly valid JSON matching the schema.
            `,
            output: {
                schema: serviceOutputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate service content");
        }
        return output;
    }
);

