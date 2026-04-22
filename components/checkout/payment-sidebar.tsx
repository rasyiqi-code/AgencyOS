"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, AlertTriangle, Tag, Check } from "lucide-react";
import { ExtendedEstimate, Coupon, ServiceAddon } from "@/lib/shared/types";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

export function PaymentSidebar({ estimate, amount, onPrint, onApplyCoupon, activeRate, appliedCoupon, hasActiveGateway = true, defaultPaymentType, projectPaidAmount, projectTotalAmount, context, user, orderId, selectedAddons = [] }: {
    estimate: ExtendedEstimate,
    onPrint: () => void,
    onApplyCoupon: (coupon: Coupon | null) => void,
    bankDetails?: { bank_name?: string, bank_account?: string, bank_holder?: string } | null,
    activeRate?: number,
    amount: number,
    appliedCoupon: Coupon | null,
    hasActiveGateway?: boolean,
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number,
    projectTotalAmount?: number,
    context?: "SERVICE" | "CALCULATOR",
    user?: { displayName: string | null, email: string | null },
    orderId?: string | null,
    selectedAddons?: ServiceAddon[]
}) {
    console.log("DEBUG CHECKOUT - priceType:", estimate.service?.priceType);
    console.log("DEBUG CHECKOUT - status:", estimate.status);
    const t = useTranslations("Checkout");
    const ti = useTranslations("Invoice");
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    useEffect(() => {
        if (estimate.status === 'paid' && orderId && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [estimate.status, orderId, countdown]);

    useEffect(() => {
        if (countdown <= 0 && estimate.status === 'paid' && orderId) {
            router.push(`/invoices/${orderId}`);
        }
    }, [countdown, estimate.status, orderId, router]);
    const [paymentType, setPaymentType] = useState<"FULL" | "DP" | "REPAYMENT">(defaultPaymentType || "FULL");
    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    const { currency, rate } = useCurrency();
    const baseCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

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

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        try {
            const response = await fetch('/api/marketing/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput, context: context })
            });

            const result = await response.json();

            if (result.valid) {
                onApplyCoupon((result.coupon as Coupon) || null);
                toast.success(t("couponApplied"));
            } else {
                toast.error(result.message || t("invalidCoupon"));
                onApplyCoupon(null);
            }
        } catch {
            toast.error(t("validateError"));
        } finally {
            setIsValidating(false);
        }
    };

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
                    currency: currency,
                    selectedAddons: selectedAddons
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

    const isPaid = estimate.status === 'paid';

    if (isPaid) {
        return (
            <div className="w-full max-w-md mx-auto text-center space-y-8 py-12 animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center mb-2">
                        <CheckCircle className="w-10 h-10 text-brand-yellow" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-yellow tracking-tighter">
                        {t("confirmed")}
                    </h2>
                    <p className="text-brand-yellow/60 text-sm max-w-xs mx-auto">
                        {t("confirmedDesc")}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="inline-block px-6 py-2 rounded-full bg-brand-yellow/5 border border-brand-yellow/10 text-xs font-bold text-brand-yellow/40 uppercase tracking-[0.2em]">
                        {t('transactionId')}: #{estimate.id.slice(-8).toUpperCase()}
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        {countdown > 0 && orderId ? (
                            <div className="space-y-4">
                                <div className="text-8xl font-black text-brand-yellow tracking-tighter drop-shadow-[0_0_30px_rgba(254,215,0,0.3)]">
                                    {countdown}
                                </div>
                                <div className="text-[12px] font-black text-brand-yellow/40 uppercase tracking-[0.4em] animate-pulse">
                                    Redirecting to Invoice...
                                </div>
                            </div>
                        ) : (
                            <div className="px-8 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold tracking-widest uppercase text-sm">
                                Payment Verified
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sticky top-24">
            {/* Customer Information (Identity Step Preview) */}
            {user && (
                <Card className="bg-zinc-900 border-white/10 text-white overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-lime-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="px-4 sm:px-6 pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-lime-500" />
                                {ti("billTo")}
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-white" onClick={() => window.location.href = '/handler/sign-in'}>
                                {t("change")}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4">
                        <div className="space-y-1">
                            <div className="text-sm font-bold text-white">{user.displayName || "Valued Client"}</div>
                            <div className="text-xs text-zinc-400 font-mono">{user.email}</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-zinc-900 border-white/10 text-white">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-xl sm:text-2xl break-words">{t("title")}</CardTitle>
                    <CardDescription className="text-sm break-words">
                        {t("selectPayment")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">

                    <>
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
                    </>

                    {/* Pricing Display or Input Box */}
                    {estimate.status !== 'paid' && (
                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3 text-white">
                                <Tag className="w-3.5 h-3.5 text-brand-yellow" />
                                <span className="font-medium text-[10px] uppercase tracking-wider text-zinc-400">{t("haveCoupon")}</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    placeholder={t("enterCode")}
                                    className="h-10 bg-zinc-950/50 border-zinc-800 text-white focus:ring-brand-yellow/50 uppercase text-xs"
                                    disabled={!!appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-white/5 hover:bg-white/10 text-white h-10 px-4 text-xs"
                                        onClick={() => {
                                            setCouponInput("");
                                            onApplyCoupon(null);
                                        }}
                                    >
                                        {t("change")}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="bg-brand-yellow text-black hover:bg-brand-yellow/80 h-10 px-4 font-bold text-xs"
                                        onClick={handleApplyCoupon}
                                        disabled={isValidating || !couponInput}
                                    >
                                        {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("apply")}
                                    </Button>
                                )}
                            </div>
                            {appliedCoupon && (
                                <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                    <Check className="w-3 h-3" />
                                    {t("applied")}: {appliedCoupon.code}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-zinc-800/50 p-4 sm:p-6 rounded-xl border border-white/5">
                        <div className="flex flex-col gap-1 mb-4">
                            <span className="text-zinc-400 text-sm font-medium">
                                {t("totalToPay")}
                            </span>
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-emerald-400 mb-1">
                                    <span>{t("discount")} ({appliedCoupon.code})</span>
                                    <span>
                                        - <PriceDisplay amount={estimate.totalCost - amount} baseCurrency={baseCurrency} />
                                    </span>
                                </div>
                            )}
                            <span className="text-3xl font-bold text-white tracking-tight">
                                <PriceDisplay amount={amountToPay} baseCurrency={baseCurrency} />
                            </span>
                            {paymentType === "DP" && (
                                <div className="flex justify-between text-xs text-zinc-500 mt-2 pt-2 border-t border-white/5">
                                    <span>{t("totalProjectValue")}:</span>
                                    <span><PriceDisplay amount={amount} baseCurrency={baseCurrency} /></span>
                                </div>
                            )}
                            {appliedCoupon && paymentType === "FULL" && (
                                <span className="text-xs text-zinc-500 line-through">
                                    <PriceDisplay amount={estimate.totalCost} baseCurrency={baseCurrency} />
                                </span>
                            )}
                        </div>

                        <p className="text-[10px] text-zinc-500 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                            <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                            {t("processedIn")} {currency === 'IDR' ? 'IDR' : 'USD'} {currency === 'IDR' && (rate || activeRate) && (
                                `(rate: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rate || activeRate || 0)})`
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
        </div>
    );
}
