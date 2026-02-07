import { NextRequest, NextResponse } from "next/server";
import { squadService } from "@/lib/server/squad";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await stackServerApp.getUser();
    // Todo: Add admin check
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await squadService.rejectProfile(id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to reject profile" },
            { status: 500 }
        );
    }
}
