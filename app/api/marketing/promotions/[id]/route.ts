import { NextResponse } from "next/server";
import { updatePromotion, deletePromotion } from "@/lib/server/marketing";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const promotion = await updatePromotion(params.id, {
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
    { params }: { params: { id: string } }
) {
    try {
        await deletePromotion(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete promotion error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
