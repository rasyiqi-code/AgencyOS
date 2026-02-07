import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, deleteSubscriber } from "@/lib/server/marketing";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const subscribers = await getSubscribers();
        return NextResponse.json(subscribers);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await deleteSubscriber(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
