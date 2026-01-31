import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/server/marketing";

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();
        if (!code) {
            return NextResponse.json({ valid: false, message: "Coupon code is required" }, { status: 400 });
        }

        const result = await validateCoupon(code);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Coupon validation API error:", error);
        return NextResponse.json({ valid: false, message: (error as Error).message }, { status: 500 });
    }
}
