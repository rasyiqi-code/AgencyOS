"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, AlertTriangle, MessageSquare, Inbox, Send, ChevronUp, Tag, Check } from "lucide-react";
import { ExtendedEstimate, Coupon } from "@/lib/shared/types";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

export function PaymentSidebar({ estimate, amount, onPrint, onApplyCoupon, activeRate, appliedCoupon, hasActiveGateway = true, defaultPaymentType, projectPaidAmount, projectTotalAmount, context }: {
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
    context?: "SERVICE" | "CALCULATOR"
}) {
    console.log("DEBUG CHECKOUT - priceType:", estimate.service?.priceType);
    console.log("DEBUG CHECKOUT - status:", estimate.status);
    const t = useTranslations("Checkout");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentType, setPaymentType] = useState<"FULL" | "DP" | "REPAYMENT">(defaultPaymentType || "FULL");
    const [offeredPrice, setOfferedPrice] = useState<string>("");
    console.log("DEBUG SIDEBAR - priceType:", estimate.service?.priceType);
    console.log("DEBUG SIDEBAR - status:", estimate.status);
    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    // Identify if this is a quote negotiation step
    const isQuoteNegotiation = (estimate.service?.priceType === "STARTING_AT") && (estimate.status === "draft" || estimate.status === "pending");

    // Hybrid Strategy: Check if offer is below starting price
    const currentOfferValue = parseFloat(offeredPrice.replace(/[^0-9.-]+/g, "")) || 0;
    const { currency, rate } = useCurrency();

    // The base currency set in the service
    const baseCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';
    // The currency currently active in the UI
    const activeCurrency = currency;

    // Convert estimate base cost to active viewing currency to compare apples-to-apples
    const isReady = typeof window !== 'undefined';
    let startingPriceInActiveCurrency = estimate.totalCost;
    if (isReady && baseCurrency !== activeCurrency) {
        startingPriceInActiveCurrency = activeCurrency === 'IDR' ? estimate.totalCost * rate : estimate.totalCost / rate;
    }

    const isBelowStartingPrice = isQuoteNegotiation && currentOfferValue > 0 && currentOfferValue < startingPriceInActiveCurrency;
    console.log("DEBUG SIDEBAR - isQuoteNegotiation:", isQuoteNegotiation);

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

    const handleSubmitOffer = async (channel?: 'whatsapp' | 'telegram' | 'inbox') => {
        let numericOffer = parseFloat(offeredPrice.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numericOffer) || numericOffer <= 0) {
            alert(t("invalidOffer"));
            return;
        }

        // Convert the offered price back to the service's base currency before storing it in DB
        if (baseCurrency !== activeCurrency) {
            numericOffer = activeCurrency === 'IDR' ? numericOffer / rate : numericOffer * rate;
        }

        setIsProcessing(true);
        try {
            const response = await fetch("/api/store/quote-offer", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estimateId: estimate.id,
                    offeredPrice: numericOffer,
                }),
            });

            if (!response.ok) {
                alert(t("offerSubmitError"));
                return;
            }

            // Phase 15: Auto-send chat message if channel is inbox
            if (channel === 'inbox') {
                const summary = generateQuoteSummary();
                await fetch("/api/support/ticket/create", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        initialMessage: summary,
                        type: "chat"
                    })
                }).catch(err => console.error("Auto-chat error:", err));

                window.location.href = '/dashboard/inbox';
                return;
            }

            if (!channel) {
                // Default fallback if no channel selected (though UI now requires one)
                window.location.href = '/dashboard/quotes';
            }

        } catch (e) {
            console.error("Offer Error:", e);
            alert(t("offerSubmitError"));
            setIsProcessing(false);
        }
    };

    const generateQuoteSummary = () => {
        const numericOffer = parseFloat(offeredPrice.replace(/[^0-9.-]+/g, ""));
        const priceLabel = numericOffer > 0
            ? `${activeCurrency === 'IDR' ? 'Rp' : '$'}${new Intl.NumberFormat(activeCurrency === 'IDR' ? 'id-ID' : 'en-US').format(numericOffer)}`
            : t("discussPrice");

        return t("quoteSummaryMessage", { service: estimate.service?.title || estimate.title, id: estimate.id.slice(-8).toUpperCase(), price: priceLabel });
    };

    if (estimate.status === 'paid') {
        return (
            <Card className="bg-brand-yellow/10 border-brand-yellow/20 text-white sticky top-24">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-8 h-8 text-brand-yellow" />
                        <CardTitle className="text-brand-yellow">{t("confirmed")}</CardTitle>
                    </div>
                    <CardDescription className="text-brand-yellow/80">
                        {t("confirmedDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-brand-yellow/5 border border-brand-yellow/20 text-sm text-brand-yellow/90">
                        {t('transactionId')}: #{estimate.id.slice(-8).toUpperCase()}
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full border-brand-yellow/30 bg-transparent text-brand-yellow hover:bg-brand-yellow/10 hover:text-brand-yellow/90 cursor-pointer"
                            onClick={onPrint}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t("downloadReceipt")}
                        </Button>

                        <Button
                            className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-bold h-12 cursor-pointer"
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
        <div className="space-y-4 sticky top-24">
            <Card className="bg-zinc-900 border-white/10 text-white">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-xl sm:text-2xl break-words">{isQuoteNegotiation ? t("submitOffer") : t("paymentOptions")}</CardTitle>
                    <CardDescription className="text-sm break-words">
                        {isQuoteNegotiation
                            ? t("submitOfferDesc")
                            : t("selectPayment")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">

                    {!isQuoteNegotiation && (
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
                    )}

                    {/* Pricing Display or Input Box */}
                    {estimate.status !== 'paid' && !isQuoteNegotiation && (
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

                    {/* Pricing Display or Input Box */}
                    {isQuoteNegotiation ? (
                        <div className="space-y-3 sm:space-y-4">
                            <label className="text-zinc-400 text-xs sm:text-sm font-medium block">{t("yourOfferPrice", { currency: activeCurrency })}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 text-zinc-400 font-medium text-sm sm:text-base">
                                    {activeCurrency === 'IDR' ? 'Rp' : '$'}
                                </span>
                                <input
                                    type="text"
                                    value={offeredPrice}
                                    onChange={(e) => {
                                        // simpler numeric formatter for both currencies
                                        const val = e.target.value.replace(/\D/g, "");
                                        const formatted = val ? new Intl.NumberFormat(activeCurrency === 'IDR' ? 'id-ID' : 'en-US').format(Number(val)) : "";
                                        setOfferedPrice(formatted);
                                    }}
                                    placeholder={new Intl.NumberFormat(activeCurrency === 'IDR' ? 'id-ID' : 'en-US').format(startingPriceInActiveCurrency)}
                                    className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 sm:pr-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-base sm:text-lg font-semibold placeholder:text-zinc-600"
                                />
                            </div>
                            <p className="text-[10px] sm:text-xs text-zinc-500">
                                {t("basePriceFrom")} <PriceDisplay amount={estimate.totalCost} baseCurrency={baseCurrency} />
                            </p>

                            {isBelowStartingPrice && (
                                <div className="flex gap-2 p-2.5 sm:p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-in fade-in slide-in-from-top-1">
                                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] sm:text-xs text-amber-200/90 leading-relaxed">
                                        {t("belowStartingPrice")}
                                    </p>
                                </div>
                            )}

                        </div>
                    ) : (
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
                    )}

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

                        {isQuoteNegotiation ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="w-full bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                                        disabled={isProcessing || currentOfferValue === 0}
                                        title={currentOfferValue === 0 ? t("enterOfferFirst") : ""}
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        {t("sendOfferContact")}
                                        <ChevronUp className="w-4 h-4 ml-2 group-data-[state=open]:rotate-180 transition-transform" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-zinc-950 border-zinc-800 p-4" align="end" side="top">
                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 text-center">
                                            {t("chooseChannel")}
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 h-10"
                                            onClick={() => {
                                                const msg = encodeURIComponent(generateQuoteSummary());
                                                handleSubmitOffer('whatsapp');
                                                window.open(`https://wa.me/628123456789?text=${msg}`, '_blank');
                                            }}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-3" />
                                            WhatsApp
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 h-10"
                                            onClick={() => {
                                                const msg = encodeURIComponent(generateQuoteSummary());
                                                handleSubmitOffer('telegram');
                                                window.open(`https://t.me/AgencyOS_Bot?text=${msg}`, '_blank');
                                            }}
                                        >
                                            <Send className="w-4 h-4 mr-3" />
                                            Telegram
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-zinc-800 bg-white/5 text-zinc-300 hover:bg-white/10 h-10"
                                            onClick={() => handleSubmitOffer('inbox')}
                                        >
                                            <Inbox className="w-4 h-4 mr-3" />
                                            {t("liveChat")}
                                        </Button>

                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-[10px] text-zinc-500 text-center italic">
                                                {t("offerAutoSaved")}
                                            </p>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : hasActiveGateway ? (
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
