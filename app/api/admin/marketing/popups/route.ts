import { NextRequest, NextResponse } from "next/server";
import { getPopUps, createPopUp, updatePopUp, deletePopUp, togglePopUpStatus } from "@/lib/server/popups";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const popups = await getPopUps();
        return NextResponse.json(popups);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const popup = await createPopUp(body);
        return NextResponse.json({ success: true, data: popup });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        let popup;
        if (Object.keys(data).length === 1 && 'isActive' in data) {
            popup = await togglePopUpStatus(id, data.isActive);
        } else {
            popup = await updatePopUp(id, data);
        }

        return NextResponse.json({ success: true, data: popup });
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

        await deletePopUp(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
