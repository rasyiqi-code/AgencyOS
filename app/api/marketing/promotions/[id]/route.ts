import { NextResponse } from "next/server";
import { updatePromotion, deletePromotion } from "@/lib/server/marketing";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const promotion = await updatePromotion(id, {
            ...body,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });
        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Update promotion error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deletePromotion(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete promotion error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

