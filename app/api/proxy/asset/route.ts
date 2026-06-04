import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/shared/url";

const ALLOWED_CONTENT_TYPES = [
    "image/",
    "font/",
    "text/css"
];

export async function GET(req: NextRequest) {
    const assetUrl = req.nextUrl.searchParams.get("url");

    const requestOrigin = req.headers.get("origin");
    let appUrl = getAppUrl();
    if (!appUrl.startsWith("http")) {
        appUrl = `https://${appUrl}`;
    }

    let allowedOrigin = appUrl;

    try {
        if (requestOrigin) {
            const requestUrl = new URL(requestOrigin);
            const appDomain = new URL(appUrl).hostname;

            if (requestUrl.hostname === appDomain || requestUrl.hostname.endsWith(`.${appDomain}`)) {
                allowedOrigin = requestOrigin;
            }
        }
    } catch {
        // Ignore invalid origins
    }

    const headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=3600",
    };

    if (!assetUrl) return new NextResponse("Missing URL", { status: 400, headers });

    // Validate URL format
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(assetUrl);
    } catch {
        return new NextResponse("Invalid URL format", { status: 400, headers });
    }

    // Pengamanan Tambahan dari PR #75: Hanya izinkan protokol http dan https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return new NextResponse("Invalid protocol", { status: 400, headers });
    }

    if (req.method === "OPTIONS") {
        return new NextResponse(null, { headers });
    }

    try {
        console.log(`[AssetProxy] Requesting: ${assetUrl}`);
        const origin = new URL(assetUrl).origin;
        const response = await fetch(assetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": origin,
            }
        });

        if (!response.ok) {
            console.error(`[AssetProxy] Remote Error: ${response.status} for ${assetUrl}`);
            return new NextResponse(`Proxy error: ${response.status}`, { status: response.status, headers });
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        
        // Validate Content-Type
        const isAllowedContentType = ALLOWED_CONTENT_TYPES.some(type => contentType.toLowerCase().startsWith(type));
        if (!isAllowedContentType) {
            console.error(`[AssetProxy] Blocked request for invalid content type: ${contentType}`);
            return new NextResponse("Forbidden: Invalid content type", { status: 403, headers });
        }

        const buffer = await response.arrayBuffer();

        console.log(`[AssetProxy] Remote Status: ${response.status}, Type: ${contentType}`);

        return new NextResponse(buffer, {
            headers: {
                ...headers,
                "Content-Type": contentType,
            },
        });
    } catch (error) {
        console.error("[AssetProxy] Fatal Error:", error);
        return new NextResponse("Internal Proxy Error", { status: 500, headers });
    }
}
