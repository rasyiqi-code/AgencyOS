"use server";

import { isAdmin } from "@/lib/shared/auth-helpers";
import { triggerExternalWebhook } from "@/lib/server/webhook-trigger";

/**
 * Simulates an external webhook for testing SaaS integration.
 * Auth check: Admin only.
 */
export async function simulateWebhook(data: {
    url: string;
    payload: Record<string, unknown>;
}) {
    try {
        if (!await isAdmin()) {
            return { success: false, error: "Unauthorized" };
        }

        if (!data.url) {
            return { success: false, error: "Missing webhook URL" };
        }

        console.log(`[SIMULATOR] Sending test payload to ${data.url}`);
        
        const result = await triggerExternalWebhook(data.url, data.payload);
        
        return result;
    } catch (error: unknown) {
        console.error("[SIMULATOR_ERROR]", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
