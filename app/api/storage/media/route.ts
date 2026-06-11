import { NextRequest, NextResponse } from "next/server";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { listFiles, uploadFile } from "@/lib/integrations/storage";

export async function GET(req: NextRequest) {
    const user = await hexclaveServerApp.getUser();
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
    const user = await hexclaveServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder")?.toString() || "media";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Batasi ukuran file unggahan maksimal 15MB untuk mencegah pemborosan memori RAM (mencegah crash OOM)
        const MAX_FILE_SIZE = 15 * 1024 * 1024; 
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ 
                error: "File size exceeds the 15MB limit" 
            }, { status: 400 });
        }

        let uploadPayload: File | Uint8Array = file;
        let finalFileName = file.name;
        let finalType = file.type;
        let fileSize = file.size;

        // Optimization: Convert images to WebP
        const isProcessableImage = file.type.startsWith("image/") &&
            !file.type.includes("svg") &&
            !file.type.includes("webp");

        if (isProcessableImage) {
            try {
                // Memuat modul sharp secara dinamis agar tidak crash jika library native tidak tersedia
                const sharp = (await import("sharp")).default;
                // Hanya membaca arrayBuffer jika sharp berhasil di-load secara dinamis
                const buffer = new Uint8Array(await file.arrayBuffer());
                const processedBuffer = await sharp(buffer)
                    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 80, effort: 2 })
                    .toBuffer();
                
                uploadPayload = processedBuffer;
                fileSize = processedBuffer.length;

                // Change extension to .webp
                const baseName = file.name.includes('.')
                    ? file.name.substring(0, file.name.lastIndexOf('.'))
                    : file.name;
                finalFileName = `${baseName}.webp`;
                finalType = "image/webp";
            } catch (sharpError) {
                console.error("[Storage API] Sharp conversion error, falling back to original:", sharpError);
                uploadPayload = file;
                fileSize = file.size;
            }
        }

        const storagePath = `${folder}/${Date.now()}-${finalFileName}`;
        const url = await uploadFile(uploadPayload, storagePath, finalType);

        return NextResponse.json({
            success: true,
            url,
            fileName: storagePath,
            size: fileSize,
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
