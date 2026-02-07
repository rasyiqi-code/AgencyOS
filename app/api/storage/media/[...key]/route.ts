import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/config/stack";
import { deleteFile } from "@/lib/integrations/storage";

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ key: string | string[] }> }
) {
    const params = await props.params;
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // With catch-all [...key], params.key is an array of segments
        const keySegments = params.key;
        const key = Array.isArray(keySegments)
            ? keySegments.map(s => decodeURIComponent(s)).join('/')
            : decodeURIComponent(keySegments);

        await deleteFile(key);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Storage API] Delete error:", error);
        return NextResponse.json({
            error: "Failed to delete file",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
