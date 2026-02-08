"use client";

import { useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceDocument, type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";
import { PaymentSelector } from "@/components/payment/payment-selector";
import { ExtendedEstimate } from "@/lib/shared/types";
import { useCurrency } from "@/components/providers/currency-provider";
import type { MidtransPaymentData, CreemPaymentMetadata, BankDetails } from "@/types/payment";

interface InvoiceClientWrapperProps {
    order: {
        id: string;
        amount: number;
        status: string;
        type: string; // Added type for DP/Repayment check
        projectId: string | null;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        paymentMetadata: MidtransPaymentData | CreemPaymentMetadata | null;
        project: {
            id: string;
            title: string;
            service?: {
                id: string;
                title: string;
            } | null;
        } | null;
    };
    estimate: ExtendedEstimate;
    user: {
        displayName: string;
        email: string;
    };
    isPaid: boolean;
    bankDetails?: BankDetails;
    agencySettings?: AgencyInvoiceSettings;
    hasActiveGateway?: boolean;
}

const thankYouQuotes = [
    "“The future belongs to those who believe in the beauty of their dreams.” — Eleanor Roosevelt",
    "“Innovation distinguishes between a leader and a follower.” — Steve Jobs",
    "“The best way to predict the future is to create it.” — Peter Drucker",
    "“Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.” — Steve Jobs",
    "“Technology is best when it brings people together.” — Matt Mullenweg"
];

export function InvoiceClientWrapper({ order, estimate, user, isPaid, bankDetails, agencySettings, hasActiveGateway = true }: InvoiceClientWrapperProps) {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);
    const { currency, rate } = useCurrency();
    const quote = useMemo(() => {
        // Deterministic quote based on Order ID
        const index = order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % thankYouQuotes.length;
        return thankYouQuotes[index];
    }, [order.id]);

    useEffect(() => {
        if (isPaid) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/payment/status?orderId=${order.id}&mode=json`);
                const data = await res.json();

                if (data.status === 'paid' || data.status === 'settled') {
                    router.refresh();
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaid, order.id, router]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice-${order.id}`,
    });

    // Calculate display amount for Total Due showing in sidebar
    const displayAmount = currency === 'IDR' ? Math.ceil(order.amount * rate) : order.amount;

    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start">

            {/* Left Column: Invoice Document */}
            <div className="flex-1 w-full order-2 xl:order-1">
                {/* Header Info Mobile */}
                <div className="mb-6 flex justify-between items-center xl:hidden">
                    <h1 className="text-xl font-bold text-white">Invoice #{order.id}</h1>
                    {isPaid && <span className="text-emerald-400 font-bold border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">PAID</span>}
                </div>

                <div className="bg-white text-black rounded-lg shadow-2xl overflow-hidden min-h-[800px]">
                    <InvoiceDocument
                        refAction={componentRef}
                        estimate={estimate}
                        user={user}
                        isPaid={isPaid}
                        agencySettings={agencySettings}
                        paymentType={order.type}
                    />
                </div>
            </div>

            {/* Right Column: Payment Sidebar */}
            <div className="w-full xl:w-[400px] xl:sticky xl:top-24 space-y-6 order-1 xl:order-2">
                {/* Status Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">Invoice Status</h2>
                            <p className="text-zinc-400 text-xs">#{order.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                {isPaid ? "PAID" : "UNPAID"}
                            </div>
                            {(order.type === 'DP' || order.type === 'REPAYMENT') && (
                                <div className="px-2 py-1 rounded-full text-[10px] font-bold border bg-zinc-800 text-zinc-400 border-zinc-700">
                                    {order.type}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isPaid && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-zinc-300">Total Due</span>
                                <span className="text-xl font-bold text-white">
                                    {new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency }).format(displayAmount)}
                                </span>
                            </div>

                            {!hasActiveGateway && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs font-semibold text-amber-500 mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Metode Otomatis Belum Aktif
                                    </p>
                                    <p className="text-[10px] text-amber-200/70 leading-relaxed">
                                        Gateway pembayaran belum dikonfigurasi. Mohon gunakan transfer bank manual ke rekening yang tertera di invoice.
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-zinc-500">
                                Please complete payment below to activate project.
                            </p>
                        </div>
                    )}

                    {isPaid && (
                        <div className="text-center py-4 space-y-4">
                            <div>
                                <div className="text-emerald-400 font-medium mb-2">Payment Received</div>
                                <p className="text-xs text-zinc-500">Thank you for your business. We are excited to build with you.</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <a href="/support" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1">
                            Need Help? Contact Support
                        </a>
                    </div>
                </div>

                {/* Download Button (Only if Paid) */}
                {isPaid && (
                    <div className="space-y-6">
                        <Button
                            onClick={handlePrint}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-12 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download / Print Invoice
                        </Button>

                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                            <div className="relative bg-zinc-900 border border-white/10 p-6 rounded-lg text-center space-y-3">
                                <div className="text-2xl text-lime-400 opacity-50 font-serif">&quot;</div>
                                <p className="text-sm text-zinc-300 italic font-serif leading-relaxed">
                                    {quote.split(" — ")[0]}
                                </p>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                                    — {quote.split(" — ")[1]}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Core API Payment Widget */}
                {!isPaid && (
                    <PaymentSelector
                        orderId={order.id}
                        amount={displayAmount}
                        paymentMetadata={order.paymentMetadata}
                        currency={currency}
                        // Allow all groups if IDR, filter if USD (handled inside widget)
                        allowedGroups={undefined}
                        bankDetails={bankDetails}
                        orderStatus={order.status}
                    />
                )}

                {!isPaid && (
                    <p className="text-center text-xs text-zinc-500">
                        Protected by 256-bit SSL encryption.
                    </p>
                )}
            </div>
        </div>
    );
}
