import { NextRequest, NextResponse } from "next/server";
import { getPromotionCoupon } from "@/lib/server/marketing";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const contextParam = searchParams.get("context");
        
        let context: "DIGITAL" | "SERVICE" | "CALCULATOR" | undefined;
        if (contextParam === "DIGITAL" || contextParam === "SERVICE" || contextParam === "CALCULATOR") {
            context = contextParam;
        }

        const coupon = await getPromotionCoupon(context);
        
        if (!coupon) {
            // Fallback jika belum ada kupon promosi yang dibuat di database
            return NextResponse.json({
                code: "WELCOME10",
                discountType: "percentage",
                discountValue: 10
            });
        }

        return NextResponse.json({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });
    } catch (error) {
        console.error("[API Coupon Promotion] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
