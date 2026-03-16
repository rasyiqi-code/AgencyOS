import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const assetUrl = req.nextUrl.searchParams.get("url");
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=3600",
    };

    if (!assetUrl) return new NextResponse("Missing URL", { status: 400, headers });

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

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        
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
