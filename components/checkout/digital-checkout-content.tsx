"use client";

import { useState } from "react";
import { DigitalCheckoutSummary } from "@/components/checkout/digital-checkout-summary";
import { CheckoutForm } from "@/components/checkout/digital-checkout-form";
import { Bonus, Coupon } from "@/lib/shared/types";

interface Product {
    id: string;
    name: string;
    price: number;
    purchaseType: string;
    interval?: string;
}

export function DigitalCheckoutContent({
    product,
    bonuses,
    userId,
    userEmail,
    activeRate
}: {
    product: Product;
    bonuses: Bonus[];
    userId?: string;
    userEmail?: string;
    activeRate?: number;
}) {
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    const discountedAmount = appliedCoupon
        ? appliedCoupon.discountType === 'percentage'
            ? product.price * (1 - appliedCoupon.discountValue / 100)
            : Math.max(0, product.price - appliedCoupon.discountValue)
        : product.price;

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full">
            {/* Left: Summary */}
            <div className="flex-1">
                <DigitalCheckoutSummary
                    product={product}
                    bonuses={bonuses}
                    onApplyCoupon={(coupon) => setAppliedCoupon(coupon)}
                    appliedCoupon={appliedCoupon}
                />
            </div>

            {/* Right: Payment Form */}
            <div className="w-full lg:w-96 sticky top-24">
                <CheckoutForm
                    product={product}
                    userId={userId}
                    userEmail={userEmail}
                    appliedCoupon={appliedCoupon}
                    amount={discountedAmount}
                    activeRate={activeRate}
                />
            </div>
        </div>
    );
}
