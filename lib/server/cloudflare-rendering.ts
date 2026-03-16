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
            throw new Error(`Cloudflare Browser Rendering failed: ${error}`);
        }

        const data = await response.json();
        
        // The /content endpoint returns the HTML in the 'result' or directly?
        // According to docs, it returns the HTML of the rendered page.
        // Let's handle the specific response format.
        if (data.success && data.result) {
            return data.result.content || "";
        }
        
        return "";
    } catch (error) {
        console.error("Error fetching rendered HTML:", error);
        throw error;
    }
}
