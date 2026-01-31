import { NextResponse } from "next/server";
import { getPromotionCoupon } from "@/lib/server/marketing";

export async function GET() {
    try {
        const coupon = await getPromotionCoupon();
        if (!coupon) {
            return NextResponse.json({ error: "No active promotion found" }, { status: 404 });
        }
        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Promotion coupon API error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
