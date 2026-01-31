"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import { ExtendedEstimate, Coupon } from "@/lib/types";
import { PriceDisplay } from "@/components/providers/currency-provider";

export function PaymentSidebar({ estimate, amount, onPrint, activeRate, appliedCoupon }: { estimate: ExtendedEstimate, onPrint: () => void, bankDetails?: { bank_name?: string, bank_account?: string, bank_holder?: string } | null, activeRate?: number, amount: number, appliedCoupon: Coupon | null }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"one_time" | "monthly" | "yearly">("one_time");

    // const { currency, formattedRate } = useCurrency(); // If implemented globally
    const currency = activeRate && activeRate > 0 ? "IDR" : "USD"; // Simplistic fallback
    const formattedRate = activeRate ? activeRate.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : '';

    // Explicitly cast or access currency 
    const activeCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

    // Calculate monthly/yearly rates (Mock logic for display)
    const monthlyAmount = amount / 12 * 1.2; // 20% premium for monthly
    // ... comments ...

    const displayAmount = billingCycle === 'monthly' ? monthlyAmount : (billingCycle === 'yearly' ? amount : amount);

    if (estimate.status === 'paid') {
        return (
            <Card className="bg-emerald-950/30 border-emerald-500/20 text-white sticky top-24">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <CardTitle className="text-emerald-400">Payment Confirmed</CardTitle>
                    </div>
                    <CardDescription className="text-emerald-500/80">
                        Thank you! Your payment has been verified and your mission is now active.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
                        Transaction ID: #{estimate.id.slice(-8).toUpperCase()}
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer"
                            onClick={onPrint}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Receipt
                        </Button>

                        <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 cursor-pointer"
                            onClick={() => window.location.href = '/dashboard/missions'}
                        >
                            Access Mission Control
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900 border-white/10 text-white sticky top-24">
            <CardHeader>
                <CardTitle>Choose Plan</CardTitle>
                <CardDescription>Select a billing cycle that works for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Billing Cycle Selection */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setBillingCycle("one_time")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${billingCycle === "one_time" ? "bg-white text-black border-white" : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"}`}
                    >
                        One-time
                    </button>
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-white text-black border-white" : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-white text-black border-white" : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"}`}
                    >
                        Yearly
                    </button>
                </div>

                {/* Currency Conversion Info */}
                <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-1 mb-4">
                        <span className="text-zinc-400 text-sm font-medium">
                            {billingCycle === 'one_time' ? 'Total One-time Payment' : (billingCycle === 'monthly' ? 'Monthly Payment' : 'Yearly Payment')}
                        </span>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-emerald-400 mb-1">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>
                                    - <PriceDisplay amount={estimate.totalCost - amount} />
                                </span>
                            </div>
                        )}
                        <span className="text-3xl font-bold text-white tracking-tight">
                            <PriceDisplay amount={displayAmount} baseCurrency={activeCurrency} />
                            {billingCycle === 'monthly' && <span className="text-sm font-normal text-zinc-500 ml-1">/mo</span>}
                            {billingCycle === 'yearly' && <span className="text-sm font-normal text-zinc-500 ml-1">/yr</span>}
                        </span>
                        {appliedCoupon && (
                            <span className="text-xs text-zinc-500 line-through">
                                <PriceDisplay amount={estimate.totalCost} baseCurrency={activeCurrency} />
                            </span>
                        )}
                    </div>

                    <p className="text-[10px] text-zinc-500 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                        Processed in {currency === 'IDR' ? 'IDR' : 'USD'} {currency === 'IDR' && `(rate: ${formattedRate})`}
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
                        Download PDF Invoice
                    </Button>

                    <Button
                        className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isProcessing || billingCycle !== 'one_time'}
                        onClick={async () => {
                            // Only support one-time for now via this generic route
                            if (billingCycle !== 'one_time') return;

                            setIsProcessing(true);
                            try {
                                const response = await fetch("/api/checkout", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        estimateId: estimate.id,
                                        amount: amount, // Use discounted amount
                                        title: estimate.title,
                                        couponCode: appliedCoupon?.code
                                    }),
                                });

                                if (!response.ok) {
                                    const err = await response.text();
                                    console.error("Payment Error:", err);
                                    alert(`Payment Error: ${err}`);
                                    throw new Error(err || "Failed to create order");
                                }
                                const { orderId } = await response.json();

                                // Redirect to Public Invoice
                                window.location.href = `/invoices/${orderId}`;
                            } catch (e) {
                                console.error(e);
                                setIsProcessing(false);
                            }
                        }}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            billingCycle === 'one_time' ? "Proceed to Payment" : "Contact Sales for Subscription"
                        )}
                    </Button>
                    {billingCycle !== 'one_time' && (
                        <p className="text-xs text-center text-yellow-500/80">
                            Currently only One-time payment is available for instant checkout.
                        </p>
                    )}
                </div>

                <p className="text-xs text-zinc-500 text-center">
                    Secure 256-bit SSL encrypted.
                </p>

                <div className="text-center pt-2">
                    <a href="/support" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-300 underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400 transition-all">
                        Problem with payment?
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
