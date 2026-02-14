import { NextRequest, NextResponse } from "next/server";
import { squadService } from "@/lib/server/squad";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check: hanya admin yang boleh accept application
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await squadService.acceptApplication(id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to accept application" },
            { status: 500 }
        );
    }
}
