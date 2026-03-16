import { getSettingValue } from "@/lib/server/settings";

export async function fetchRenderedHtml(url: string): Promise<string> {
    const accountId = await getSettingValue("cloudflare_account_id");
    const apiToken = await getSettingValue("cloudflare_api_token");

    console.log(`[CloudflareProxy] Fetching: ${url}`);
    
    if (!accountId || !apiToken) {
        console.error("[CloudflareProxy] Missing credentials");
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
            console.error(`[CloudflareProxy] Status: ${response.status}, Error: ${error}`);
            throw new Error(`Cloudflare Browser Rendering failed (${response.status}): ${error}`);
        }

        // Try to parse as JSON, but if the API returns raw HTML, Fallback to text.
        const contentType = response.headers.get("content-type");
        console.log(`[CloudflareProxy] Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.success && data.result) {
                console.log("[CloudflareProxy] Success (JSON)");
                // Some endpoints return result as a string (the HTML), others return an object with 'content'
                return typeof data.result === 'string' ? data.result : (data.result.content || "");
            }
            console.error(`[CloudflareProxy] API Error: ${JSON.stringify(data.errors)}`);
            throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
        } else {
            console.log("[CloudflareProxy] Success (Raw HTML)");
            // It's likely raw HTML
            return await response.text();
        }
    } catch (error) {
        console.error("[CloudflareProxy] Fatal Error:", error);
        throw error;
    }
}
