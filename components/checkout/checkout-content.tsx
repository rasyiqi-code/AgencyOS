"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocale } from "next-intl";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { PaymentSidebar } from "@/components/checkout/payment-sidebar";
import { InvoiceDocument, type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";
import { useCurrency } from "@/components/providers/currency-provider";
import { ExtendedEstimate, Bonus, Coupon, ServiceAddon } from "@/lib/shared/types";
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
    const locale = useLocale();
    const isId = locale === 'id';

    const serviceAddons = (isId && Array.isArray((estimate.service as unknown as Record<string, unknown>)?.addons_id) && ((estimate.service as unknown as Record<string, unknown>)?.addons_id as unknown[]).length > 0)
        ? (estimate.service as unknown as Record<string, unknown>).addons_id as ServiceAddon[]
        : (estimate.service?.addons as ServiceAddon[]) || [];

    // Parse initially selected addons from the estimate summary (if it was already updated)
    const initiallyIncludedAddons = serviceAddons.filter((addon) => estimate.summary.includes(`+ ${addon.name}`));

    const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>(initiallyIncludedAddons);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${estimate.id}`,
    });

    // Calculate the TRUE base cost (estimate.totalCost minus any addons that are already baked into it)
    const initiallyIncludedAddonsTotal = initiallyIncludedAddons.reduce((sum: number, addon) => sum + (addon.price || 0), 0);
    const trueBaseCost = estimate.totalCost - initiallyIncludedAddonsTotal;

    const addonsTotal = selectedAddons.reduce((sum: number, addon) => sum + (addon.price || 0), 0);
    const baseTotal = trueBaseCost + addonsTotal;

    // Reconstruct the summary for the dynamic estimate
    const addonsMarker = "\n\nAdd-ons Selected at Checkout:";
    const cleanSummary = estimate.summary.includes(addonsMarker)
        ? estimate.summary.substring(0, estimate.summary.indexOf(addonsMarker))
        : estimate.summary;
    
    let currentAddonsSummary = "";
    if (selectedAddons.length > 0) {
        currentAddonsSummary = addonsMarker;
        selectedAddons.forEach((addon) => {
            const currencySymbol = addon.currency === 'IDR' ? 'Rp' : '$';
            currentAddonsSummary += `\n- + ${addon.name} (${currencySymbol}${addon.price} ${addon.interval === "monthly" ? "Monthly" : addon.interval === "yearly" ? "Yearly" : "One-time"})`;
        });
    }

    const dynamicEstimate = {
        ...estimate,
        totalCost: baseTotal,
        summary: cleanSummary + currentAddonsSummary
    };

    const discountedAmount = appliedCoupon
        ? appliedCoupon.discountType === 'percentage'
            ? baseTotal * (1 - appliedCoupon.discountValue / 100)
            : Math.max(0, baseTotal - appliedCoupon.discountValue)
        : baseTotal;

    const isPaid = estimate.status === 'paid';

    return (
        <div className={`flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto ${isPaid ? 'justify-center items-center py-12' : ''}`}>
            {/* Left: Summary & Trust (Replaces Invoice) */}
            {!isPaid && (
                <div className="flex-1">
                    <CheckoutSummary
                        estimate={{ ...estimate, totalCost: trueBaseCost }}
                        bonuses={bonuses}
                        context={context}
                        selectedAddons={selectedAddons}
                        onToggleAddon={(addon) => {
                            setSelectedAddons(prev => 
                                prev.some(a => a.name === addon.name)
                                    ? prev.filter(a => a.name !== addon.name)
                                    : [...prev, addon]
                            );
                        }}
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
                    selectedAddons={selectedAddons}
                />
            </div>

            {/* Hidden Invoice for Printing */}
            <div className="hidden">
                <div className="bg-white">
                    <InvoiceDocument
                        refAction={invoiceRef}
                        estimate={dynamicEstimate}
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
