
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/config/stack";
import { uploadFile } from "@/lib/integrations/storage";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        // Use a clean filename for R2
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `logos/${timestamp}-${safeName}`;

        const url = await uploadFile(file, key);

        return NextResponse.json({ success: true, url });

    } catch (error) {
        console.error("R2 Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
