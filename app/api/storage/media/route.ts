import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/config/stack";
import { listFiles, uploadFile } from "@/lib/integrations/storage";

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

        const fileName = `${folder}/${Date.now()}-${file.name}`;
        const url = await uploadFile(file, fileName);

        return NextResponse.json({
            success: true,
            url,
            fileName,
            size: file.size,
            type: file.type
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
