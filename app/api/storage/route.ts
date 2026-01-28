
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        // General R2 Upload
        const { uploadFile } = await import("@/lib/storage");
        const filename = `uploads/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const url = await uploadFile(file, filename);

        if (url.startsWith("http")) {
            return NextResponse.json({ success: true, url });
        } else {
            throw new Error("Upload failed to return a valid URL");
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("General Storage Upload Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
