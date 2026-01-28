
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/system");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch {
            // Ignore error if directory exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const url = `/uploads/system/${filename}`;

        return NextResponse.json({ success: true, url });

    } catch (error) {
        console.error("Local Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
