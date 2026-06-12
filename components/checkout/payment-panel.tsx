"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Loader2, Check, Layers, PlusCircle } from "lucide-react";
import { ExtendedEstimate, ServiceAddon } from "@/lib/shared/types";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { PaymentSelector } from "@/components/payment/payment-selector";

export function PaymentPanel({
    estimate,
    amount,
    amountToPay,
    paymentType,
    onChangePaymentType,
    onPrint,
    bankDetails,
    activeRate,
    hasActiveGateway = true,
    gatewayStatus,
    defaultPaymentType,
    projectPaidAmount,
    projectTotalAmount,
    user,
    orderId,
    selectedAddons = [],
    onToggleAddon,
    agencySettings,
    onOpenSummary
}: {
    estimate: ExtendedEstimate,
    onPrint: () => void,
    bankDetails?: { bank_name?: string, bank_account?: string, bank_holder?: string } | null,
    activeRate?: number,
    amount: number,
    amountToPay: number,
    paymentType: "FULL" | "DP" | "REPAYMENT",
    onChangePaymentType: (type: "FULL" | "DP" | "REPAYMENT") => void,
    hasActiveGateway?: boolean,
    gatewayStatus?: { midtrans: boolean; creem: boolean },
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number,
    projectTotalAmount?: number,
    user?: { displayName: string | null, email: string | null },
    orderId?: string | null,
    selectedAddons?: ServiceAddon[],
    onToggleAddon?: (addon: ServiceAddon) => void,
    agencySettings?: any,
    onOpenSummary: () => void
}) {
    const t = useTranslations("Checkout");
    const ti = useTranslations("Invoice");
    const locale = useLocale();
    const isId = locale === 'id';
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(orderId || null);
    const [activeOrderStatus, setActiveOrderStatus] = useState<string>("pending");


    const { currency, rate } = useCurrency();
    const baseCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

    // Get available addons from the service
    const serviceAddons = isId
        ? (estimate.service?.addons_id as ServiceAddon[]) || (estimate.service?.addons as ServiceAddon[])
        : (estimate.service?.addons as ServiceAddon[]) || [];

    // Polling status transaksi di background ketika Order ID aktif terisi
    useEffect(() => {
        if (!activeOrderId || estimate.status === 'paid') return;

        const interval = setInterval(async () => {
            if (document.hidden) return;
            try {
                const res = await fetch(`/api/payment/status?orderId=${activeOrderId}&mode=json`);
                const data = await res.json();

                if (data.status === 'waiting_verification') {
                    setActiveOrderStatus('waiting_verification');
                } else if (data.status === 'paid' || data.status === 'settled') {
                    router.refresh();
                }
            } catch (error) {
                console.error("Gagal melakukan polling status pembayaran:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeOrderId, estimate.status, router]);

    // Efek untuk memantau status lunas (Selesai) guna pengalihan ke Invoice publik
    useEffect(() => {
        if (estimate.status === 'paid' && activeOrderId && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [estimate.status, activeOrderId, countdown]);

    useEffect(() => {
        if (countdown <= 0 && estimate.status === 'paid' && activeOrderId) {
            router.push(`/invoices/${activeOrderId}`);
        }
    }, [countdown, estimate.status, activeOrderId, router]);



    const formattedBankDetails = estimate.project && agencySettings ? {
        bank_name: agencySettings.bankName,
        bank_account: agencySettings.bankAccount,
        bank_holder: agencySettings.bankHolder
    } : (bankDetails ? {
        bank_name: bankDetails.bank_name || undefined,
        bank_account: bankDetails.bank_account || undefined,
        bank_holder: bankDetails.bank_holder || undefined
    } : undefined);

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    estimateId: estimate.id,
                    amount: amountToPay,
                    title: estimate.title,
                    paymentType: paymentType,
                    currency: currency,
                    selectedAddons: selectedAddons
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                const errorMessage = err.error || err.message || JSON.stringify(err);
                toast.error(`${t("failProcess") || "Gagal melakukan checkout"}: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            const { orderId: newOrderId } = await response.json();

            setActiveOrderId(newOrderId);
            toast.success("Pesanan berhasil dibuat! Silakan pilih metode pembayaran.");
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const isPaid = estimate.status === 'paid';

    // 1. Tampilan jika transaksi sudah lunas (PAID)
    if (isPaid) {
        return (
            <div className="w-full text-center space-y-8 py-16 animate-in fade-in zoom-in duration-700 max-w-md mx-auto">
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
                        {countdown > 0 && activeOrderId ? (
                            <div className="space-y-4">
                                <div className="text-8xl font-black text-brand-yellow tracking-tighter drop-shadow-[0_0_30px_rgba(254,215,0,0.3)]">
                                    {countdown}
                                </div>
                                <div className="text-[12px] font-black text-brand-yellow/40 uppercase tracking-[0.4em] animate-pulse">
                                    {t("redirectingToInvoice") || "Mengalihkan ke Invoice..."}
                                </div>
                            </div>
                        ) : (
                            <div className="px-8 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold tracking-widest uppercase text-sm">
                                {t("paymentVerified") || "Pembayaran Terverifikasi"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Tampilan Form & Konfigurasi Aktif (Minecraft Server Style Redesign)
    return (
        <div className="h-full flex flex-col justify-between p-6 pr-0 sm:p-8 sm:pr-0 lg:pl-12 lg:py-4 bg-transparent border-0">
            
            {/* Scrollable Main Area */}
            <div className="space-y-6 flex-grow">

                {/* Tipe Pembayaran (DP vs FULL) - Selektor Paket Horizontal Minecraft Style */}
                <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                        {isId ? "Pilih Tipe Pembayaran" : "Select Payment Plan"}
                    </span>
                    
                    {activeOrderId ? (
                        <div className="flex justify-between items-center bg-zinc-950/50 border border-white/5 p-4 rounded-xl">
                            <span className="text-xs font-bold text-zinc-400">
                                {isId ? "Tipe Terpilih" : "Selected Plan"}
                            </span>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-extrabold bg-white/10 text-white px-3.5 py-1.5 rounded-full border border-white/5">
                                    {paymentType === "FULL" ? t("fullPayment") : paymentType === "DP" ? t("dp") : t("repayment")}
                                </span>
                                {!orderId && (
                                    <button
                                        onClick={() => setActiveOrderId(null)}
                                        className="text-xs text-lime-400 hover:text-lime-300 font-bold transition-colors hover:underline bg-transparent border-0 cursor-pointer"
                                    >
                                        {t("change") || "Ubah"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        defaultPaymentType === 'REPAYMENT' ? (
                            <div className="p-3.5 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow text-sm font-bold text-center">
                                {t("repayment")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Option 1: Full Payment */}
                                <div 
                                    onClick={() => onChangePaymentType("FULL")}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[96px] relative overflow-hidden group ${
                                        paymentType === "FULL" 
                                            ? 'bg-lime-500/5 border-lime-500/40 shadow-[0_0_15px_rgba(132,204,22,0.08)]' 
                                            : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold transition-colors ${paymentType === "FULL" ? 'text-lime-400' : 'text-zinc-200'}`}>
                                            {t("fullPayment") || "Pembayaran Penuh"}
                                        </span>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                            paymentType === "FULL" ? 'bg-lime-400 border-lime-400 text-black' : 'border-zinc-700'
                                        }`}>
                                            {paymentType === "FULL" && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-normal">
                                        {isId ? "Ideal untuk pengerjaan cepat dan diskon langsung." : "Ideal for immediate setup and hassle-free payment."}
                                    </p>
                                </div>

                                {/* Option 2: DP Payment */}
                                <div 
                                    onClick={() => onChangePaymentType("DP")}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[96px] relative overflow-hidden group ${
                                        paymentType === "DP" 
                                            ? 'bg-lime-500/5 border-lime-500/40 shadow-[0_0_15px_rgba(132,204,22,0.08)]' 
                                            : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold transition-colors ${paymentType === "DP" ? 'text-lime-400' : 'text-zinc-200'}`}>
                                            {t("dp") || "Pembayaran DP (50%)"}
                                        </span>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                            paymentType === "DP" ? 'bg-lime-400 border-lime-400 text-black' : 'border-zinc-700'
                                        }`}>
                                            {paymentType === "DP" && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-normal">
                                        {isId ? "Proyek dimulai dengan 50% di muka, sisa setelah selesai." : "Start project with 50% upfront, remaining on completion."}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Bill To Info */}
                {user && (
                    <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                            {ti("billTo") || "Tagih Ke"}
                        </span>
                        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="text-sm font-bold text-white tracking-tight">{user.displayName || "Valued Client"}</div>
                                <div className="text-xs text-zinc-400 font-mono tracking-tight">{user.email}</div>
                            </div>
                            {!activeOrderId && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2.5 text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-lg border border-white/5" 
                                    onClick={() => window.location.href = '/handler/sign-in'}
                                >
                                    {t("change")}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Configure Add-ons (Checkbox selection ala kuesioner Minecraft) */}
                {!activeOrderId && serviceAddons && serviceAddons.length > 0 && (
                    <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                            {isId ? "Konfigurasi Add-ons Opsional" : "Configure Optional Add-ons"}
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                            {serviceAddons.map((addon, i) => {
                                const isSelected = selectedAddons.some(a => a.name === addon.name);
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => onToggleAddon && onToggleAddon(addon)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform active:scale-[0.99] group ${
                                            isSelected 
                                                ? 'bg-lime-500/5 border-lime-500/30 shadow-[0_0_15px_rgba(132,204,22,0.04)]' 
                                                : 'bg-zinc-950/40 border-white/5 hover:bg-zinc-950/70 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4.5 h-4.5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                isSelected 
                                                    ? 'bg-lime-400 border-lime-400 text-black shadow-[0_0_8px_rgba(132,204,22,0.3)]' 
                                                    : 'border-zinc-700 group-hover:border-zinc-500'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                                            </div>
                                            <div>
                                                <div className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                                                    isSelected ? 'text-lime-400' : 'text-zinc-200 group-hover:text-white'
                                                }`}>
                                                    {addon.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-mono font-bold text-zinc-300">
                                                {addon.currency === 'IDR' ? 'Rp' : '$'} {addon.price.toLocaleString()}
                                            </span>
                                            {addon.interval && (
                                                <span className="text-[10px] text-zinc-500 font-medium ml-1">
                                                    {addon.interval === 'monthly' ? '/bln' : addon.interval === 'yearly' ? '/thn' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Gateway Payment Selector (Muncul secara dinamis setelah order id dibuat) */}
                {activeOrderId && (
                    <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block pl-1">
                            {isId ? "Pilih Metode Pembayaran" : "Select Payment Method"}
                        </span>
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-zinc-950/30 border border-white/5 p-4 rounded-2xl">
                            <PaymentSelector
                                orderId={activeOrderId}
                                amount={amountToPay}
                                currency={currency as 'USD' | 'IDR'}
                                bankDetails={formattedBankDetails}
                                orderStatus={activeOrderStatus}
                                contactWA={agencySettings?.phone}
                                contactTele={agencySettings?.telegram}
                                hasActiveGateway={hasActiveGateway}
                                gatewayStatus={gatewayStatus}
                                noCard={true}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Minecraft-style Bottom Specification & Checkout Action Footer Bar */}
            <div className="pt-6 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-4 z-20 lg:pr-0 w-full">
                {/* Checkout Actions */}
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    {/* Download PDF button */}
                    <Button
                        variant="outline"
                        className="border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-300 h-10 px-4 rounded-xl cursor-pointer text-xs"
                        onClick={onPrint}
                        disabled={isProcessing}
                    >
                        {isId ? "Unduh PDF" : "Download PDF"}
                    </Button>

                    {activeOrderId ? (
                        <div className="text-[10px] text-zinc-500 font-bold bg-zinc-900/50 px-3.5 py-2.5 rounded-xl border border-white/5 text-center leading-none select-none">
                            {isId ? "Menunggu Verifikasi" : "Awaiting Payment"}
                        </div>
                    ) : (
                        <Button
                            className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-extrabold h-10 px-6 rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(132,204,22,0.25)] transition-all duration-300 transform hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] text-xs shrink-0 flex-grow sm:flex-grow-0"
                            disabled={isProcessing}
                            onClick={handleCheckout}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    {t("processing")}
                                </>
                            ) : (
                                isId ? "PROSES SEKARANG" : "PROCEED TO PAYMENT"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
