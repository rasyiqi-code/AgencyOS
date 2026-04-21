import { NextResponse } from "next/server";
import { getPromotions, createPromotion } from "@/lib/server/marketing";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const admin = searchParams.get("admin") === "true";
        const promotions = await getPromotions(!admin);
        return NextResponse.json(promotions);
    } catch (error) {
        console.error("Promotions API error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const promotion = await createPromotion({
            ...body,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });
        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Create promotion error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
