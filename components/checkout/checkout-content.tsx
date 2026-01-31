"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { PaymentSidebar } from "@/components/checkout/payment-sidebar";
import { ExtendedEstimate } from "@/lib/types";
import type { BankDetails } from "@/types/payment";

export function CheckoutContent({ estimate, bankDetails, activeRate, bonuses }: { estimate: ExtendedEstimate, bankDetails: BankDetails, activeRate: number, bonuses: any[] }) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discountType: 'percentage' | 'fixed', discountValue: number } | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${estimate.id}`,
    });

    const discountedAmount = appliedCoupon
        ? appliedCoupon.discountType === 'percentage'
            ? estimate.totalCost * (1 - appliedCoupon.discountValue / 100)
            : Math.max(0, estimate.totalCost - appliedCoupon.discountValue)
        : estimate.totalCost;

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Left: Summary & Trust (Replaces Invoice) */}
            <div className="flex-1">
                <CheckoutSummary
                    estimate={estimate}
                    bonuses={bonuses}
                    onApplyCoupon={(coupon) => setAppliedCoupon(coupon)}
                    appliedCoupon={appliedCoupon}
                />
            </div>

            {/* Right: Payment Actions */}
            <div className="w-full lg:w-96 space-y-6">
                <PaymentSidebar
                    estimate={estimate}
                    amount={discountedAmount}
                    onPrint={() => handlePrint && handlePrint()}
                    bankDetails={bankDetails}
                    activeRate={activeRate}
                    appliedCoupon={appliedCoupon}
                />
            </div>
        </div>
    );
}
