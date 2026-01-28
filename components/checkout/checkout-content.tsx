"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { PaymentSidebar } from "@/components/checkout/payment-sidebar";
import { ExtendedEstimate } from "@/lib/types";
import type { BankDetails } from "@/types/payment";

export function CheckoutContent({ estimate, bankDetails, activeRate }: { estimate: ExtendedEstimate, bankDetails: BankDetails, activeRate: number }) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${estimate.id}`,
    });

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Left: Summary & Trust (Replaces Invoice) */}
            <div className="flex-1">
                <CheckoutSummary estimate={estimate} />
            </div>

            {/* Right: Payment Actions */}
            <div className="w-full lg:w-96 space-y-6">
                <PaymentSidebar
                    estimate={estimate}
                    onPrint={() => handlePrint && handlePrint()}
                    bankDetails={bankDetails}
                    activeRate={activeRate}
                />
            </div>
        </div>
    );
}
