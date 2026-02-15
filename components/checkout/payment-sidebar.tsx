"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { ExtendedEstimate, Coupon } from "@/lib/shared/types";
import { PriceDisplay } from "@/components/providers/currency-provider";

import { useTranslations } from "next-intl";

export function PaymentSidebar({ estimate, amount, onPrint, activeRate, appliedCoupon, hasActiveGateway = true, defaultPaymentType, projectPaidAmount, projectTotalAmount }: {
    estimate: ExtendedEstimate,
    onPrint: () => void,
    bankDetails?: { bank_name?: string, bank_account?: string, bank_holder?: string } | null,
    activeRate?: number,
    amount: number,
    appliedCoupon: Coupon | null,
    hasActiveGateway?: boolean,
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number,
    projectTotalAmount?: number
}) {
    const t = useTranslations("Checkout");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentType, setPaymentType] = useState<"FULL" | "DP" | "REPAYMENT">(defaultPaymentType || "FULL");

    // const { currency, formattedRate } = useCurrency(); // If implemented globally
    const currency = activeRate && activeRate > 0 ? "IDR" : "USD"; // Simplistic fallback

    // Explicitly cast or access currency 
    const activeCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

    let amountToPay = amount;
    if (paymentType === "DP") {
        amountToPay = amount * 0.5;
    } else if (paymentType === "REPAYMENT") {
        // Calculate remaining amount
        // Use projectTotalAmount if available, otherwise fallback to current amount (which might be estimate cost)
        const total = projectTotalAmount && projectTotalAmount > 0 ? projectTotalAmount : amount;
        const paid = projectPaidAmount || 0;
        amountToPay = Math.max(0, total - paid);
    }

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    estimateId: estimate.id,
                    amount: amountToPay, // Calculated based on type
                    title: estimate.title,
                    appliedCoupon: appliedCoupon?.code,
                    paymentType: paymentType,
                    currency: currency
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("Payment Error:", err);
                const errorMessage = err.error || err.message || JSON.stringify(err);
                alert(`Payment Error: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            const { orderId } = await response.json();

            // Redirect to Public Invoice
            window.location.href = `/invoices/${orderId}`;
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
        }
    };

    if (estimate.status === 'paid') {
        return (
            <Card className="bg-emerald-950/30 border-emerald-500/20 text-white sticky top-24">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <CardTitle className="text-emerald-400">{t("confirmed")}</CardTitle>
                    </div>
                    <CardDescription className="text-emerald-500/80">
                        {t("confirmedDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
                        {t('transactionId')}: #{estimate.id.slice(-8).toUpperCase()}
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer"
                            onClick={onPrint}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t("downloadReceipt")}
                        </Button>

                        <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 cursor-pointer"
                            onClick={() => window.location.href = '/dashboard/missions'}
                        >
                            {t("accessMission")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900 border-white/10 text-white sticky top-24">
            <CardHeader>
                <CardTitle>{t("paymentOptions")}</CardTitle>
                <CardDescription>{t("selectPayment")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Payment Type Selection */}
                {/* Hide selection if query param enforces repayment */}
                {defaultPaymentType === 'REPAYMENT' ? (
                    <div className="p-3 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow text-sm font-medium text-center mb-2">
                        {t("repayment")}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setPaymentType("FULL")}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${paymentType === "FULL" ? "bg-white text-black border-white" : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"}`}
                        >
                            {t("fullPayment")}
                        </button>
                        <button
                            onClick={() => setPaymentType("DP")}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${paymentType === "DP" ? "bg-white text-black border-white" : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"}`}
                        >
                            {t("dp")}
                        </button>
                    </div>
                )}

                {paymentType === "DP" && (
                    <div className="text-xs text-amber-500 bg-amber-500/10 p-3 rounded border border-amber-500/20">
                        {t("dpDesc")}
                    </div>
                )}

                {/* Currency Conversion Info */}
                <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-1 mb-4">
                        <span className="text-zinc-400 text-sm font-medium">
                            {t("totalToPay")}
                        </span>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-emerald-400 mb-1">
                                <span>{t("discount")} ({appliedCoupon.code})</span>
                                <span>
                                    - <PriceDisplay amount={estimate.totalCost - amount} />
                                </span>
                            </div>
                        )}
                        <span className="text-3xl font-bold text-white tracking-tight">
                            <PriceDisplay amount={amountToPay} baseCurrency={activeCurrency} />
                        </span>
                        {paymentType === "DP" && (
                            <div className="flex justify-between text-xs text-zinc-500 mt-2 pt-2 border-t border-white/5">
                                <span>{t("totalProjectValue")}:</span>
                                <span><PriceDisplay amount={amount} baseCurrency={activeCurrency} /></span>
                            </div>
                        )}
                        {appliedCoupon && paymentType === "FULL" && (
                            <span className="text-xs text-zinc-500 line-through">
                                <PriceDisplay amount={estimate.totalCost} baseCurrency={activeCurrency} />
                            </span>
                        )}
                    </div>

                    <p className="text-[10px] text-zinc-500 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                        {t("processedIn")} {currency === 'IDR' ? 'IDR' : 'USD'} {currency === 'IDR' && activeRate && (
                            `(rate: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(activeRate)})`
                        )}
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white cursor-pointer"
                        onClick={onPrint}
                        disabled={isProcessing}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t("downloadInvoice")}
                    </Button>

                    {hasActiveGateway ? (
                        <Button
                            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={handleCheckout}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t("processing")}
                                </>
                            ) : (
                                t("proceed")
                            )}
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs font-semibold text-amber-500 mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {t("manualPayment")}
                                </p>
                                <p className="text-[10px] text-amber-200/70 leading-relaxed">
                                    {t("manualDesc")}
                                </p>
                            </div>
                            <Button
                                className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-12"
                                onClick={handleCheckout}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t("processing")}
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        {t("continue")}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <p className="text-xs text-zinc-500 text-center">
                    {t("secure")}
                </p>

                <div className="text-center pt-2">
                    <a href="/support" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-300 underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400 transition-all">
                        {t("problem")}
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
