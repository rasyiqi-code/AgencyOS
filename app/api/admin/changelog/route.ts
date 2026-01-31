import { NextRequest, NextResponse } from "next/server";
import { createChangelog, updateChangelog, deleteChangelog } from "@/lib/server/admin-changelog";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const result = await createChangelog(data);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, ...data } = await req.json();
        const result = await updateChangelog(id, data);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) throw new Error("ID required");
        const result = await deleteChangelog(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
