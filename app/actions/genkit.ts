'use server';

import { serviceGeneratorFlow } from '@/app/genkit';

export async function generateServiceAction(description: string) {
    try {
        const result = await serviceGeneratorFlow(description);
        return { success: true, data: result };
    } catch (error) {
        console.error("Service Generation Error:", error);
        return { success: false, error: "Failed to generate service content" };
    }
}
