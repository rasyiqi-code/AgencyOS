import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

import { pricingService } from '@/lib/server/pricing-service';

export const estimateFlow = ai.defineFlow(
    {
        name: 'estimateFlow',
        inputSchema: z.string(),
        outputSchema: z.object({
            title: z.string(),
            summary: z.string(),
            complexity: z.string(),
            screens: z.array(z.object({
                title: z.string(),
                description: z.string(),
                hours: z.number()
            })),
            apis: z.array(z.object({
                title: z.string(),
                description: z.string(),
                hours: z.number()
            })),
            totalHours: z.number(),
            totalCost: z.number()
        }),
    },
    async (prompt) => {
        const { model } = await getActiveAIConfig();

        // Fetch Dynamic Pricing Config
        const pricing = await pricingService.getConfig();
        const { baseRate, multipliers } = pricing;

        const { output } = await ai.generate({
            model: `googleai/${model}`,
            prompt: `
            You are an expert software estimator.
            Analyze this project requirement and generate a detailed cost estimate.
            
            Current Requirement: "${prompt}"

            PRICING MODEL:
            - Base Rate: $${baseRate}/hr
            - Complexity Multipliers:
              - Low: ${multipliers.Low}x (Rate: $${baseRate * multipliers.Low}/hr)
              - Medium: ${multipliers.Medium}x (Rate: $${baseRate * multipliers.Medium}/hr)
              - High: ${multipliers.High}x (Rate: $${baseRate * multipliers.High}/hr)

            RULES:
            1. Determine Complexity first (Low, Medium, High).
            2. Use the corresponding Hourly Rate for Total Cost calculation.
            3. Break down into Screens (UI) and APIs (Backend).
            4. Be realistic. Simple pages = 4-8 hours. Complex CRUD = 12-20 hours.
            5. Return strictly valid JSON matching the schema.
            6. DETECT LANGUAGE: If the prompt is in Indonesian, the output (Title, Summary, Descriptions) MUST be in Indonesian. If English, use English. Match the user's language.
            `,
            output: {
                schema: z.object({
                    title: z.string(),
                    summary: z.string(),
                    complexity: z.string(),
                    screens: z.array(z.object({
                        title: z.string(),
                        description: z.string(),
                        hours: z.number()
                    })),
                    apis: z.array(z.object({
                        title: z.string(),
                        description: z.string(),
                        hours: z.number()
                    })),
                    totalHours: z.number(),
                    totalCost: z.number()
                })
            }
        });

        if (!output) {
            console.error("Genkit Output Error: Output is null or undefined");
            throw new Error("Failed to generate estimate - Model returned empty response");
        }
        return output;
    }
);
