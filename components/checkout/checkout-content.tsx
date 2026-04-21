"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { PaymentSidebar } from "@/components/checkout/payment-sidebar";
import { InvoiceDocument, type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";
import { useCurrency } from "@/components/providers/currency-provider";
import { ExtendedEstimate, Bonus, Coupon } from "@/lib/shared/types";
import type { BankDetails } from "@/types/payment";

export function CheckoutContent({
    estimate,
    bankDetails,
    activeRate,
    bonuses,
    user,
    agencySettings,
    hasActiveGateway = true,
    defaultPaymentType,
    projectPaidAmount = 0,
    projectTotalAmount = 0,
    context,
    orderId
}: {
    estimate: ExtendedEstimate,
    bankDetails: BankDetails,
    activeRate: number,
    bonuses: Bonus[],
    user: { displayName: string | null, email: string | null },
    agencySettings?: AgencyInvoiceSettings,
    hasActiveGateway?: boolean,
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number;
    projectTotalAmount?: number;
    context?: "SERVICE" | "CALCULATOR";
    orderId?: string | null;
}) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { currency, rate } = useCurrency();
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${estimate.id}`,
    });

    const discountedAmount = appliedCoupon
        ? appliedCoupon.discountType === 'percentage'
            ? estimate.totalCost * (1 - appliedCoupon.discountValue / 100)
            : Math.max(0, estimate.totalCost - appliedCoupon.discountValue)
        : estimate.totalCost;

    const isPaid = estimate.status === 'paid';

    return (
        <div className={`flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto ${isPaid ? 'justify-center items-center py-12' : ''}`}>
            {/* Left: Summary & Trust (Replaces Invoice) */}
            {!isPaid && (
                <div className="flex-1">
                    <CheckoutSummary
                        estimate={estimate}
                        bonuses={bonuses}
                        context={context}
                    />
                </div>
            )}

            {/* Right: Payment Actions */}
            <div className={`w-full lg:w-96 space-y-6 ${isPaid ? 'transform scale-110 transition-transform duration-500' : ''}`}>
                <PaymentSidebar
                    estimate={estimate}
                    amount={discountedAmount}
                    onPrint={() => handlePrint && handlePrint()}
                    onApplyCoupon={(coupon) => setAppliedCoupon(coupon)}
                    bankDetails={bankDetails}
                    activeRate={activeRate}
                    appliedCoupon={appliedCoupon}
                    hasActiveGateway={hasActiveGateway}
                    defaultPaymentType={defaultPaymentType}
                    projectPaidAmount={projectPaidAmount}
                    projectTotalAmount={projectTotalAmount}
                    context={context}
                    user={user}
                    orderId={orderId}
                />
            </div>

            {/* Hidden Invoice for Printing */}
            <div className="hidden">
                <div className="bg-white">
                    <InvoiceDocument
                        refAction={invoiceRef}
                        estimate={estimate}
                        user={user}
                        isPaid={estimate.status === 'paid'}
                        agencySettings={agencySettings}
                        currency={currency}
                        exchangeRate={rate || activeRate}
                        bankDetails={bankDetails}
                    />
                </div>
            </div>
        </div>
    );
}
