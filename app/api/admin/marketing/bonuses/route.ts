import { NextRequest, NextResponse } from "next/server";
import { getBonuses, createBonus, deleteBonus, toggleBonusStatus } from "@/lib/server/marketing";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const bonuses = await getBonuses();
        return NextResponse.json(bonuses);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const bonus = await createBonus(data);
        return NextResponse.json(bonus);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, isActive } = await req.json();
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const bonus = await toggleBonusStatus(id, isActive);
        return NextResponse.json(bonus);
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

        await deleteBonus(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
