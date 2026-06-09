"use server";

import { validateCoupon as validateCouponLib } from "@/lib/server/marketing";
import type { Coupon } from "@/lib/shared/types";

export async function validateCouponAction(code: string, context?: "DIGITAL" | "SERVICE" | "CALCULATOR") {
    const result = await validateCouponLib(code, context);
    return result as { valid: boolean; message?: string; coupon?: Coupon };
}
