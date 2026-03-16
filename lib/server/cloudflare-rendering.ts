import { getSettingValue } from "@/lib/server/settings";

/**
 * Enhances HTML by rewriting links to be absolute and proxying fonts.
 */
export function enhanceHtml(html: string, url: string, localBaseUrl?: string): string {
    try {
        const origin = new URL(url).origin;
        const baseUrl = url.split('?')[0].split('#')[0];
        const baseDir = baseUrl.endsWith('/') ? baseUrl : baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        
        let enhancedHtml = html;

        // Add <base> tag to handle all relative links (images, css, scripts) naturally
        if (!enhancedHtml.includes("<base") && enhancedHtml.includes("<head>")) {
            enhancedHtml = enhancedHtml.replace("<head>", `<head><base href="${baseDir}">`);
        }

        // AssetProxy configuration - MUST be absolute local URL to ignore the <base> tag
        const proxyUrl = localBaseUrl ? `${localBaseUrl}/api/proxy/asset?url=` : "/api/proxy/asset?url=";
        
        // 1. Rewrite relative fonts to be absolute Local Proxy URLs
        enhancedHtml = enhancedHtml.replace(/(href|src)="\/([^/][^"]+\.(?:woff2?|ttf|otf)(?:\?.*)?)"/g, `$1="${proxyUrl}${origin}/$2"`);
        
        // 2. Wrap absolute external fonts in absolute Proxy
        const fontRegex = /(href|src)="(https?:\/\/[^"]+\.(?:woff2?|ttf|otf)(?:\?[^"]*)?)"/g;
        enhancedHtml = enhancedHtml.replace(fontRegex, `$1="${proxyUrl}$2"`);

        // 3. Rewrite url() patterns in internal <style> blocks
        enhancedHtml = enhancedHtml.replace(/url\(['"]?([^'")]+\.(?:woff2?|ttf|otf)(?:\?.*)?)(?=['"]?\))/g, (match, path) => {
            const absoluteFontUrl = path.startsWith('http') ? path : (path.startsWith('/') ? `${origin}${path}` : `${baseDir}${path}`);
            return `url("${proxyUrl}${absoluteFontUrl}"`;
        });

        return enhancedHtml;
    } catch (e) {
        console.warn("[CloudflareProxy] Link rewriting failed", e);
        return html;
    }
}

export async function fetchRenderedHtml(url: string, localBaseUrl?: string): Promise<string> {
    const accountId = await getSettingValue("cloudflare_account_id");
    const apiToken = await getSettingValue("cloudflare_api_token");

    if (!accountId || !apiToken) {
        console.error("[CloudflareProxy] Missing credentials");
        throw new Error("Missing Cloudflare credentials (cloudflare_account_id, cloudflare_api_token) in system settings.");
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/content`;

    try {
        console.log(`[CloudflareProxy] Fetching via Browser Rendering: ${url}`);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url,
                gotoOptions: {
                    waitUntil: "networkidle2",
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CloudflareProxy] Status: ${response.status}, Error: ${errorText}`);
            
            // If Rate Limited (429), attempt fallback to simple fetch
            if (response.status === 429) {
                console.warn("[CloudflareProxy] Rate limit reached, falling back to simple fetch...");
                return await fetchRawHtml(url, localBaseUrl);
            }
            
            throw new Error(`Cloudflare Browser Rendering failed (${response.status}): ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        let html = "";
        
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.success && data.result) {
                html = typeof data.result === 'string' ? data.result : (data.result.content || "");
            } else {
                console.error(`[CloudflareProxy] API Error: ${JSON.stringify(data.errors)}`);
                throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
            }
        } else {
            html = await response.text();
        }

        return enhanceHtml(html, url, localBaseUrl);
    } catch (error) {
        console.error("[CloudflareProxy] Rendering Error:", error);
        // Fallback to simple fetch for any other top-level error (e.g. network timeout)
        return await fetchRawHtml(url, localBaseUrl);
    }
}

/**
 * Fallback: Fetches raw HTML without JavaScript execution.
 * Still applies the rewriter for absolute links and font proxying.
 */
async function fetchRawHtml(url: string, localBaseUrl?: string): Promise<string> {
    try {
        console.log(`[CloudflareProxy] Fetching Raw HTML (Fallback): ${url}`);
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            next: { revalidate: 3600 } // Cache raw fetch for 1 hour
        });
        
        if (!response.ok) {
            throw new Error(`Raw fetch failed: ${response.status}`);
        }
        
        const html = await response.text();
        return enhanceHtml(html, url, localBaseUrl);
    } catch (e) {
        console.error("[CloudflareProxy] Fallback failed:", e);
        return `<html><body><h1>Failed to load content</h1><p>${url}</p></body></html>`;
    }
}
