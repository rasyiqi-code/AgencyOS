"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { ProductShowcase } from "./product-showcase";
import { PaymentPanel } from "./payment-panel";
import { CheckoutSummary } from "./checkout-summary";
import { InvoiceDocument, type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";
import { useCurrency, PriceDisplay } from "@/components/providers/currency-provider";
import { ExtendedEstimate, Bonus, ServiceAddon } from "@/lib/shared/types";
import type { BankDetails } from "@/types/payment";
import { useReactToPrint } from "react-to-print";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Gift } from "lucide-react";

export function CheckoutPortal({
    estimate,
    bankDetails,
    activeRate,
    bonuses,
    user,
    agencySettings,
    hasActiveGateway = true,
    gatewayStatus,
    defaultPaymentType,
    projectPaidAmount = 0,
    projectTotalAmount = 0,
    context,
    orderId
}: {
    estimate: ExtendedEstimate,
    bankDetails: BankDetails | undefined,
    activeRate: number,
    bonuses: Bonus[],
    user: { displayName: string | null, email: string | null },
    agencySettings?: AgencyInvoiceSettings,
    hasActiveGateway?: boolean,
    gatewayStatus?: { midtrans: boolean; creem: boolean },
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number;
    projectTotalAmount?: number;
    context?: "SERVICE" | "CALCULATOR";
    orderId?: string | null;
}) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { currency, rate } = useCurrency();
    const locale = useLocale();
    const isId = locale === 'id';

    const serviceAddons = (isId && Array.isArray((estimate.service as unknown as Record<string, unknown>)?.addons_id) && ((estimate.service as unknown as Record<string, unknown>)?.addons_id as unknown[]).length > 0)
        ? (estimate.service as unknown as Record<string, unknown>).addons_id as ServiceAddon[]
        : (estimate.service?.addons as ServiceAddon[]) || [];

    // Parse initially selected addons from the estimate summary (if it was already updated)
    const initiallyIncludedAddons = serviceAddons.filter((addon) => estimate.summary.includes(`+ ${addon.name}`));

    const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>(initiallyIncludedAddons);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${estimate.id}`
    });

    // Calculate the TRUE base cost
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

    const discountedAmount = baseTotal;
    const isPaid = estimate.status === 'paid';

    const [paymentType, setPaymentType] = useState<"FULL" | "DP" | "REPAYMENT">(defaultPaymentType || "FULL");
    const baseCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

    // Hitung nominal harga berdasarkan tipe pembayaran
    let amountToPay = baseTotal;
    if (paymentType === "DP") {
        amountToPay = baseTotal * 0.5;
    } else if (paymentType === "REPAYMENT") {
        const total = projectTotalAmount && projectTotalAmount > 0 ? projectTotalAmount : baseTotal;
        const paid = projectPaidAmount || 0;
        amountToPay = Math.max(0, total - paid);
    }

    return (
        <div className="max-w-7xl mx-auto w-full">
            {/* Main Portal Container: Menyatu langsung dengan latar belakang (borderless & backgroundless) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10 min-h-[500px]">
                
                {/* Left Side: Product Showcase (lg:col-span-5) */}
                <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/5">
                    <ProductShowcase 
                        estimate={estimate}
                        bonuses={bonuses}
                        selectedAddons={selectedAddons}
                        amountToPay={amountToPay}
                        baseCurrency={baseCurrency}
                        onOpenSummary={() => setIsDrawerOpen(true)}
                    />
                </div>

                {/* Right Side: Payment configurator & Gateway selector (lg:col-span-7) */}
                <div className="lg:col-span-7">
                    <PaymentPanel 
                        estimate={estimate}
                        amount={discountedAmount}
                        amountToPay={amountToPay}
                        paymentType={paymentType}
                        onChangePaymentType={setPaymentType}
                        onPrint={handlePrint}
                        bankDetails={bankDetails}
                        activeRate={activeRate}
                        hasActiveGateway={hasActiveGateway}
                        gatewayStatus={gatewayStatus}
                        defaultPaymentType={defaultPaymentType}
                        projectPaidAmount={projectPaidAmount}
                        projectTotalAmount={projectTotalAmount}
                        user={user}
                        orderId={orderId}
                        selectedAddons={selectedAddons}
                        onToggleAddon={(addon) => {
                            setSelectedAddons(prev => 
                                prev.some(a => a.name === addon.name)
                                    ? prev.filter(a => a.name !== addon.name)
                                    : [...prev, addon]
                            );
                        }}
                        agencySettings={agencySettings}
                        onOpenSummary={() => setIsDrawerOpen(true)}
                    />
                </div>
            </div>

            {/* Slide-out Drawer for Full Order Details */}
            {!isPaid && (
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <SheetContent className="w-full sm:max-w-md bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 text-white overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <Gift className="w-5 h-5 text-lime-400" />
                                {isId ? "Rincian Lengkap Pesanan" : "Full Order Details"}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-zinc-400">
                                Rincian lengkap produk jasa, deliverables, modul, add-on opsional, serta bonus pemasaran Anda.
                            </SheetDescription>
                        </SheetHeader>
                        
                        <div className="pb-8">
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
                    </SheetContent>
                </Sheet>
            )}

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
