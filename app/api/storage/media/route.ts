import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/config/stack";
import { listFiles, uploadFile } from "@/lib/integrations/storage";
import sharp from "sharp";

export async function GET(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const prefix = searchParams.get("prefix") || undefined;

        const files = await listFiles(prefix);

        return NextResponse.json({ files });
    } catch (error) {
        console.error("[Storage API] List error:", error);
        return NextResponse.json({
            error: "Failed to list media files",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder")?.toString() || "media";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        let buffer: Uint8Array = new Uint8Array(await file.arrayBuffer());
        let finalFileName = file.name;
        let finalType = file.type;

        // Optimization: Convert images to WebP
        const isProcessableImage = file.type.startsWith("image/") &&
            !file.type.includes("svg") &&
            !file.type.includes("webp");

        if (isProcessableImage) {
            try {
                const processedBuffer = await sharp(buffer)
                    .webp({ quality: 80, effort: 4 })
                    .toBuffer();
                buffer = processedBuffer;

                // Change extension to .webp
                const baseName = file.name.includes('.')
                    ? file.name.substring(0, file.name.lastIndexOf('.'))
                    : file.name;
                finalFileName = `${baseName}.webp`;
                finalType = "image/webp";
            } catch (sharpError) {
                console.error("[Storage API] Sharp conversion error, falling back to original:", sharpError);
                // Fallback to original buffer and name if sharp fails
            }
        }

        const storagePath = `${folder}/${Date.now()}-${finalFileName}`;
        const url = await uploadFile(buffer, storagePath, finalType);

        return NextResponse.json({
            success: true,
            url,
            fileName: storagePath,
            size: buffer.length,
            type: finalType,
            originalName: file.name
        });
    } catch (error) {
        console.error("[Storage API] Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : "UnknownError";

        return NextResponse.json({
            error: "Failed to upload file",
            details: errorMessage,
            errorType: errorName
        }, { status: 500 });
    }
}
