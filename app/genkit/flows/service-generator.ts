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
You are an expert product manager and copywriter for a digital agency.
Your task is to generate a comprehensive service offering (base package and add-ons) based on a rough description provided by the user.

Input Description: "${sanitizedPrompt}"

=== GENERAL RULES ===
1. ILLUSTRATIVE EXAMPLES ONLY (CRITICAL):
   - All examples provided in this prompt (such as website/package names, features, before/after translations, and add-on concepts) are strictly illustrative to guide your output's tone and structure.
   - You MUST NOT copy these specific examples literally into your output unless they are explicitly requested in the user's input. Always generate original, customized content tailored directly to the input.

2. LANGUAGE & TONE:
   - Generate all text content in TWO languages: English (regular fields) and Indonesian (fields with "_id" suffix).
   - Use natural, polite, and professional Indonesian (not a literal/machine translation).
   - Write in a highly persuasive, business-oriented tone that is easily understood by non-technical clients (business owners, non-tech founders).
   - Frame technical features in terms of business value/outcomes rather than technical components.
     * Before (Technical): 'Next.js SSR Optimization & PostgreSQL Database indexing'
     * After (Business): 'Halaman website super cepat dan sistem penyimpanan data pelanggan yang responsif guna mengoptimalkan konversi penjualan.'
     * Before (Technical): 'Integrasi Midtrans Payment Gateway API & Webhook handler'
     * After (Business): 'Sistem pembayaran otomatis yang aman bagi pelanggan dengan berbagai metode bayar lokal (Transfer Bank, E-Wallet, Qris).'
     * Before (Technical): 'Setup TailwindCSS, React State Management, and Redux Toolkit'
     * After (Business): 'Tampilan visual modern yang interaktif dan nyaman diakses dari handphone maupun komputer.'

3. STRICT FORBIDDEN ITEMS (CRITICAL):
   - You MUST NEVER offer 'Custom Domain', 'Web Hosting', 'Server VPS', or 'Professional Email' anywhere in the base service or add-ons. The agency does NOT provide domain or hosting services.
   - Focus strictly on development, design, branding, SEO, marketing, copywriting, integrations, support, and maintenance.

=== SCHEMA & FIELD GUIDELINES ===
1. TITLE ("title" & "title_id"):
   - Must represent the Package Name.
   - Must explicitly mention the type of website or service requested (e.g., 'Company Profile Website Package', 'Enterprise E-Commerce Development', 'Website Toko Online Profesional').

2. DESCRIPTION ("description" & "description_id"):
   - Highly engaging, persuasive, and SEO-friendly.
   - Must be at least 3-5 paragraphs.
   - Use simple HTML formatting (<p>, <ul>, <li>, <strong>) for readability. Do not use markdown inside descriptions.

3. FEATURES ("features" & "features_id"):
   - Include and expand on every requirement mentioned in the input description.
   - Brainstorm a total of 8-12 comprehensive, high-value features.
   - Frame every feature as a benefit/deliverable for the client.

4. BASE PRICING & INTERVAL:
   - "priceType": "FIXED" or "STARTING_AT".
   - "currency": "USD" or "IDR".
     * If the input is in Indonesian or mentions 'Rp', 'Rupiah', 'Juta', or large numbers (> 10000), set currency to 'IDR'.
     * If currency is 'IDR', set recommended_price to a realistic Indonesian price (e.g., 5000000, 15000000).
     * If currency is 'USD', set recommended_price to a realistic global price (e.g., 500, 2500).
     * NEVER mix large Indonesian numbers with USD currency.
   - "interval": Choose 'one_time', 'monthly', or 'yearly' based on the service nature.
     * Project development -> 'one_time'.
     * Support, retainer, or monthly maintenance -> 'monthly'.
     * Annual support -> 'yearly'.
   - "recommended_price": Base price matching the currency.

5. ADD-ONS ("addons"):
   - Generate 2-4 highly relevant upsell options.
   - Add-on currency MUST match the main currency.
   - Relevant add-on examples:
     * For Landing Page: Extra copywriting, A/B testing setup, conversion tracking.
     * For E-Commerce: Shipping rate integration (RajaOngkir), payment gateway setup, inventory sync.
     * For Web App: Push notifications, advanced analytics dashboard, multi-language support.
   - ADD-ON INTERVAL & PRICING LOGIC:
     * Recurring services (e.g., Maintenance, Premium Support, Monthly Update Retainer) must have interval 'monthly' or 'yearly'.
     * One-off services (e.g., Extra page design, Logo branding, API Integration) must have interval 'one_time'.
     * If the add-on interval MATCHES the base service interval: Price should be 5% to 25% of the base price (recommended_price).
     * If the add-on interval is DIFFERENT (e.g., base service is 'one_time' development, add-on is 'monthly' maintenance): Set a reasonable monthly price relative to the complexity (e.g., 5% to 15% of the base price per month).
     * Round all prices to make them clean (e.g., 500000, 1000000, or 50, 150).

CRITICAL: All fields ending with "_id" must be written in human-readable, professional Indonesian text.
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

