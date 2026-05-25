import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/shared/url";

export async function GET(req: NextRequest) {
    const assetUrl = req.nextUrl.searchParams.get("url");
    const appUrl = getAppUrl();
    const headers = {
        "Access-Control-Allow-Origin": appUrl,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=3600",
    };

    if (!assetUrl) return new NextResponse("Missing URL", { status: 400, headers });

    if (req.method === "OPTIONS") {
        return new NextResponse(null, { headers });
    }

    try {
        const parsedUrl = new URL(assetUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return new NextResponse("Invalid protocol", { status: 400, headers });
        }

        console.log(`[AssetProxy] Requesting: ${assetUrl}`);
        const origin = parsedUrl.origin;
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
        
        const isSafeType = contentType.startsWith("image/") || contentType.startsWith("font/") || contentType.startsWith("text/css");
        if (!isSafeType) {
            console.error(`[AssetProxy] Unsafe Content-Type: ${contentType} for ${assetUrl}`);
            return new NextResponse("Invalid Content-Type", { status: 403, headers });
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
