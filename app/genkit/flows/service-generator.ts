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
    discount: z.number().nullable().optional(),
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
   - "features" MUST be a flat array of strings. Example: ["Feature A", "Feature B"]
   - "features_id" MUST be a flat array of strings in Indonesian. Example: ["Fitur A dalam bahasa Indonesia", "Fitur B dalam bahasa Indonesia"]
   - NEVER use array of objects for features. Each item must be a plain string.

4. BASE PRICING & INTERVAL (NICHE-SPECIFIC & TARGET MARKET MATCHING):
   - "priceType": MUST be exactly "FIXED" or "STARTING_AT" (uppercase, no other values).
   - "currency": MUST be exactly "USD" or "IDR" (uppercase, no other values).
     * If the input is in Indonesian or mentions 'Rp', 'Rupiah', 'Juta', or large numbers (> 10000), set currency to 'IDR'.
     * If currency is 'IDR', set recommended_price to a realistic Indonesian price based on the web niche and target market:
       - Low Complexity / Small Business / UKM / Personal Portfolio / Simple Landing Page: IDR 2,500,000 to IDR 6,000,000.
       - Medium Complexity / Mid-Market / Standard Company Profile / SME E-commerce: IDR 7,000,000 to IDR 15,000,000.
       - High Complexity / Custom System / Marketplace / SaaS / Enterprise Portal: IDR 18,000,000 to IDR 50,000,000+.
     * If currency is 'USD', set recommended_price to a realistic global price based on the web niche and target market:
       - Low Complexity / Personal Portfolio / Simple Landing Page: USD 250 to USD 600.
       - Medium Complexity / Standard Business Site / Basic E-commerce: USD 800 to USD 1,800.
       - High Complexity / SaaS / Enterprise App / Custom Platform: USD 2,000 to USD 6,000+.
     * Adjust the price dynamically matching the user's intent. If the prompt explicitly mentions budget constraints or high-end enterprise requirements, prioritize the user's stated target.
     * NEVER mix large Indonesian numbers with USD currency.
   - "interval": MUST be exactly one of: "one_time", "monthly", or "yearly" (no other values, no spaces, no hyphens).
     * Project development -> "one_time".
     * Support, retainer, or monthly maintenance -> "monthly".
     * Annual support -> "yearly".
   - "recommended_price": A plain number (integer or float). The base price (original price) matching the currency before any discount is applied. NO currency symbols or commas.
   - "discount": A plain integer from 0 to 60. If no discount, use 0. NEVER use null or omit this field.

5. ADD-ONS ("addons"):
   - Generate 2-4 highly relevant upsell options.
   - Each addon MUST have exactly these fields: "name" (string), "name_id" (string in Indonesian), "price" (number), "interval" (exactly "one_time", "monthly", or "yearly"), "currency" (exactly "USD" or "IDR").
   - Add-on currency MUST match the main currency.
   - Relevant add-on examples:
     * For Landing Page: Extra copywriting, A/B testing setup, conversion tracking.
     * For E-Commerce: Shipping rate integration (RajaOngkir), payment gateway setup, inventory sync.
     * For Web App: Push notifications, advanced analytics dashboard, multi-language support.
   - ADD-ON INTERVAL & PRICING LOGIC:
     * Recurring services (e.g., Maintenance, Premium Support, Monthly Update Retainer) must have interval "monthly" or "yearly".
     * One-off services (e.g., Extra page design, Logo branding, API Integration) must have interval "one_time".
     * If the add-on interval MATCHES the base service interval: Price should be 5% to 25% of the base price (recommended_price).
     * If the add-on interval is DIFFERENT (e.g., base service is "one_time" development, add-on is "monthly" maintenance): Set a reasonable monthly price relative to the complexity (e.g., 5% to 15% of the base price per month).
     * Round all prices to make them clean (e.g., 500000, 1000000, or 50, 150).

=== REQUIRED JSON OUTPUT FORMAT ===
You MUST return ONLY a raw JSON object with NO markdown, NO explanation, NO code block wrappers. The JSON must exactly match this structure:

{
  "title": "string (English package name)",
  "title_id": "string (Indonesian package name)",
  "description": "string (HTML formatted, English)",
  "description_id": "string (HTML formatted, Indonesian)",
  "features": ["string", "string", "..."],
  "features_id": ["string dalam bahasa Indonesia", "..."],
  "recommended_price": 0,
  "discount": 0,
  "priceType": "FIXED",
  "currency": "USD",
  "interval": "one_time",
  "addons": [
    {
      "name": "string",
      "name_id": "string dalam bahasa Indonesia",
      "price": 0,
      "interval": "one_time",
      "currency": "USD"
    }
  ]
}

CRITICAL CONSTRAINTS — ANY VIOLATION WILL CAUSE A SYSTEM ERROR:
- "features" and "features_id" must be arrays of plain strings, NOT objects.
- "interval" values must be exactly: "one_time", "monthly", or "yearly".
- "currency" values must be exactly: "USD" or "IDR".
- "priceType" must be exactly: "FIXED" or "STARTING_AT".
- "recommended_price" and "price" must be plain numbers, NOT strings.
- "discount" must be a plain integer (0–60), NOT null or omitted.
- Every addon must have all 5 fields: name, name_id, price, interval, currency.
- Do NOT add any extra fields not listed in the schema above.
- Output ONLY the JSON object. No text before or after.
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

