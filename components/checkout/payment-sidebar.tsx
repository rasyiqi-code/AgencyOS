"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import { ExtendedEstimate } from "@/lib/types";
import { BankTransferInfoCard } from "@/components/payment/manual/bank-transfer/info-card";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";

export function PaymentSidebar({ estimate, onPrint, bankDetails, activeRate, amount, appliedCoupon }: { estimate: ExtendedEstimate, onPrint: () => void, bankDetails: { bank_name?: string, bank_account?: string, bank_holder?: string } | null, activeRate?: number, amount: number, appliedCoupon: any }) {
    const [isProcessing, setIsProcessing] = useState(false);
    useCurrency();

    // Calculate IDR
    const rate = activeRate || 16000;
    const formattedRate = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rate);

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
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your order via manual transfer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                <BankTransferInfoCard bankDetails={bankDetails} />

                {/* Currency Conversion Info */}
                <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-1 mb-4">
                        <span className="text-zinc-400 text-sm font-medium">Total Estimate</span>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-emerald-400 mb-1">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>
                                    - <PriceDisplay amount={estimate.totalCost - amount} />
                                </span>
                            </div>
                        )}
                        <span className="text-3xl font-bold text-white tracking-tight">
                            <PriceDisplay amount={amount} />
                        </span>
                        {appliedCoupon && (
                            <span className="text-xs text-zinc-500 line-through">
                                <PriceDisplay amount={estimate.totalCost} />
                            </span>
                        )}
                    </div>

                    <p className="text-[10px] text-zinc-500 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                        Processed in IDR (rate: {formattedRate})
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
                        disabled={isProcessing}
                        onClick={async () => {
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
                            "Proceed to Payment"
                        )}
                    </Button>
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
