import { getSettingValue } from "@/lib/server/settings";

export async function fetchRenderedHtml(url: string): Promise<string> {
    const accountId = await getSettingValue("cloudflare_account_id");
    const apiToken = await getSettingValue("cloudflare_api_token");

    if (!accountId || !apiToken) {
        throw new Error("Missing Cloudflare credentials (cloudflare_account_id, cloudflare_api_token) in system settings.");
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/v1/content`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url,
                // Additional options can be added here if needed
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Cloudflare Browser Rendering failed (${response.status}): ${error}`);
        }

        // Try to parse as JSON, but if the API returns raw HTML, Fallback to text.
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.success && data.result) {
                // Some endpoints return result as a string (the HTML), others return an object with 'content'
                return typeof data.result === 'string' ? data.result : (data.result.content || "");
            }
            throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
        } else {
            // It's likely raw HTML
            return await response.text();
        }
    } catch (error) {
        console.error("Error fetching rendered HTML:", error);
        throw error;
    }
}
