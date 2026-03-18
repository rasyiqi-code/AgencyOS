/**
 * Utility to trigger external webhooks for SaaS integrations.
 */
export async function triggerExternalWebhook(url: string, payload: Record<string, unknown>) {
    try {
        console.log(`[WEBHOOK] Triggering external webhook: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AgencyOS-Webhook-Manager/1.0',
                // Optional: X-AgencyOS-Signature for verification
            },
            body: JSON.stringify({
                event: 'subscription.activated',
                timestamp: new Date().toISOString(),
                data: payload
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[WEBHOOK_ERROR] Failed to trigger webhook (${response.status}):`, errorText);
            return { success: false, status: response.status, error: errorText };
        }

        console.log(`[WEBHOOK_SUCCESS] Webhook delivered successfully to ${url}`);
        return { success: true };
    } catch (error) {
        console.error(`[WEBHOOK_EXCEPTION] Error triggering webhook:`, error);
        return { success: false, error: (error as Error).message };
    }
}
