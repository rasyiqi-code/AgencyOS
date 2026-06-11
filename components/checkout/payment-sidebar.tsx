import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { ExtendedEstimate, ServiceAddon } from "@/lib/shared/types";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PaymentSelector } from "@/components/payment/payment-selector";

export function PaymentSidebar({
    estimate,
    amount,
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
    agencySettings,
    onOpenSummary
}: {
    estimate: ExtendedEstimate,
    onPrint: () => void,
    bankDetails?: { bank_name?: string, bank_account?: string, bank_holder?: string } | null,
    activeRate?: number,
    amount: number,
    hasActiveGateway?: boolean,
    gatewayStatus?: { midtrans: boolean; creem: boolean },
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number,
    projectTotalAmount?: number,
    context?: "SERVICE" | "CALCULATOR",
    user?: { displayName: string | null, email: string | null },
    orderId?: string | null,
    selectedAddons?: ServiceAddon[],
    agencySettings?: any,
    onOpenSummary: () => void
}) {
    const t = useTranslations("Checkout");
    const ti = useTranslations("Invoice");
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    // Menyimpan Order ID aktif secara lokal untuk transisi alur tanpa reload halaman
    const [activeOrderId, setActiveOrderId] = useState<string | null>(orderId || null);
    const [activeOrderStatus, setActiveOrderStatus] = useState<string>("pending");

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
                    // Memicu rendering ulang server component saat pembayaran lunas
                    router.refresh();
                }
            } catch (error) {
                console.error("Gagal melakukan polling status pembayaran:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeOrderId, estimate.status, router]);

    const [paymentType, setPaymentType] = useState<"FULL" | "DP" | "REPAYMENT">(defaultPaymentType || "FULL");

    const { currency, rate } = useCurrency();
    const baseCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

    let amountToPay = amount;
    if (paymentType === "DP") {
        amountToPay = amount * 0.5;
    } else if (paymentType === "REPAYMENT") {
        const total = projectTotalAmount && projectTotalAmount > 0 ? projectTotalAmount : amount;
        const paid = projectPaidAmount || 0;
        amountToPay = Math.max(0, total - paid);
    }

    // Ekstrak data bank details yang aman
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
                console.error("Gagal melakukan checkout:", err);
                const errorMessage = err.error || err.message || JSON.stringify(err);
                toast.error(`${t("failProcess") || "Gagal melakukan checkout"}: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            const { orderId: newOrderId } = await response.json();

            // Set Order ID secara lokal untuk langsung memunculkan pemilih metode pembayaran
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

    // 2. Tampilan awal & pemrosesan Checkout terintegrasi kustom (Premium 2-Column Grid Redesign)
    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/70 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6.5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                {/* Background glow effect */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10 items-stretch">
                    
                    {/* Left Sub-column: Billing info & Price Summary (50% Width) */}
                    <div className="space-y-4 flex flex-col justify-start lg:pr-12 lg:border-r lg:border-white/5">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                                    {activeOrderId ? (t("paymentOptions") || "Metode Pembayaran") : t("title")}
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                                    {activeOrderId ? (t("selectPayment") || "Pilih metode pembayaran di bawah ini.") : t("selectPayment")}
                                </p>
                            </div>

                            {/* Bill To & Detail Pesanan dalam Grid Horizontal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Bill To */}
                                {user && (
                                    <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all duration-300 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between min-h-[96px]">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-lime-500 to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.6)]" />
                                                {ti("billTo")}
                                            </span>
                                            {!activeOrderId && (
                                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer" onClick={() => window.location.href = '/handler/sign-in'}>
                                                    {t("change")}
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-0.5 mt-auto">
                                            <div className="text-xs font-bold text-white tracking-tight line-clamp-1">{user.displayName || "Valued Client"}</div>
                                            <div className="text-[10px] text-zinc-400 font-mono tracking-tight line-clamp-1">{user.email}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Detail Pesanan Ringkas */}
                                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all duration-300 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between min-h-[96px]">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-yellow to-lime-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(254,215,0,0.6)]" />
                                            Detail Pesanan
                                        </span>
                                        <button
                                            onClick={onOpenSummary}
                                            className="text-[9px] text-lime-400 hover:text-lime-300 font-bold transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
                                    <div className="space-y-0.5 mt-auto">
                                        <div className="text-xs font-bold text-white tracking-tight line-clamp-1">{estimate.title}</div>
                                        <div className="text-[10px] text-zinc-400 font-medium line-clamp-1">
                                            {selectedAddons.length > 0 
                                                ? `+ ${selectedAddons.length} Add-on`
                                                : 'Tanpa add-on tambahan'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rincian Harga & Tipe Pembayaran Terintegrasi */}
                        <div className="bg-gradient-to-br from-zinc-850/60 via-zinc-900/40 to-zinc-950/60 p-4.5 rounded-2xl border border-white/5 shadow-inner space-y-4">
                            <div>
                                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                                    Tipe Pembayaran
                                </span>
                                {activeOrderId ? (
                                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-xs font-extrabold text-white">
                                            {paymentType === "FULL" ? t("fullPayment") : paymentType === "DP" ? t("dp") : t("repayment")}
                                        </span>
                                        {!orderId && (
                                            <button
                                                onClick={() => setActiveOrderId(null)}
                                                className="text-xs text-lime-400 hover:text-lime-300 font-bold transition-colors hover:underline cursor-pointer bg-transparent border-0"
                                            >
                                                {t("change") || "Ubah"}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    defaultPaymentType === 'REPAYMENT' ? (
                                        <div className="p-2.5 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow text-xs font-semibold text-center">
                                            {t("repayment")}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/5 rounded-xl">
                                            <button
                                                onClick={() => setPaymentType("FULL")}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                                                    paymentType === "FULL"
                                                        ? "bg-white text-black shadow-[0_2px_8px_rgba(255,255,255,0.05)] scale-[1.01]"
                                                        : "bg-transparent text-zinc-400 hover:text-white"
                                                }`}
                                            >
                                                {t("fullPayment")}
                                            </button>
                                            <button
                                                onClick={() => setPaymentType("DP")}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                                                    paymentType === "DP"
                                                        ? "bg-white text-black shadow-[0_2px_8px_rgba(255,255,255,0.05)] scale-[1.01]"
                                                        : "bg-transparent text-zinc-400 hover:text-white"
                                                }`}
                                            >
                                                {t("dp")}
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>

                            {paymentType === "DP" && (
                                <div className="text-[10px] text-amber-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 font-medium animate-in fade-in slide-in-from-top-1">
                                    {t("dpDesc")}
                                </div>
                            )}

                            <div className="pt-3.5 border-t border-white/5 flex flex-col gap-0.5">
                                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                    {t("totalToPay")}
                                </span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
                                    <PriceDisplay amount={amountToPay} baseCurrency={baseCurrency} />
                                </span>
                                {paymentType === "DP" && (
                                    <div className="flex justify-between text-[11px] text-zinc-500 mt-2.5 pt-2.5 border-t border-white/5 font-medium">
                                        <span>{t("totalProjectValue")}:</span>
                                        <span className="text-zinc-400"><PriceDisplay amount={amount} baseCurrency={baseCurrency} /></span>
                                    </div>
                                )}
                            </div>

                            <p className="text-[8px] text-zinc-500 pt-2.5 border-t border-white/5 flex items-center justify-center gap-1.5 opacity-60 font-medium">
                                <span className="w-1 h-1 rounded-full bg-lime-500 shrink-0 animate-pulse" />
                                {t("processedIn")} {currency === 'IDR' ? 'IDR' : 'USD'} {currency === 'IDR' && (rate || activeRate) && (
                                    `(rate: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rate || activeRate || 0)})`
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right Sub-column: Payment Selection or Checkout Actions (50% Width) */}
                    <div className="flex flex-col justify-start space-y-5 lg:pl-6">
                        {activeOrderId ? (
                            // Tampilan jika Order ID sudah dibuat (Metode Pembayaran Aktif terintegrasi)
                            <div className="flex flex-col justify-start space-y-5">
                                <div className="space-y-3.5">
                                    <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider pl-1">
                                        Pilih Metode Pembayaran
                                    </div>
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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

                                <Button
                                    variant="outline"
                                    className="w-full border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300 h-10 rounded-xl cursor-pointer text-xs"
                                    onClick={onPrint}
                                    disabled={isProcessing}
                                >
                                    <Download className="w-3.5 h-3.5 mr-2" />
                                    {t("downloadInvoice")}
                                </Button>
                            </div>
                        ) : (
                            // Tampilan awal sebelum Order ID dibuat (Tombol Lanjut & Unduh)
                            <div className="flex flex-col justify-start space-y-5">
                                <div className="space-y-3">
                                    <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider pl-1">
                                        Konfirmasi Pembayaran
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed pl-1">
                                        Silakan periksa kembali rincian tagihan Anda di sisi kiri dan ringkasan pesanan di sisi kanan. Setelah yakin, klik tombol di bawah untuk membuat pesanan dan memilih metode pembayaran otomatis atau manual yang tersedia.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2.5">
                                        <Button
                                            className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-extrabold h-11 rounded-xl cursor-pointer shadow-[0_4px_20px_rgba(132,204,22,0.2)] hover:shadow-[0_4px_25px_rgba(132,204,22,0.35)] transition-all duration-300 transform hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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

                                        <Button
                                            variant="outline"
                                            className="w-full border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300 h-10 rounded-xl cursor-pointer text-xs"
                                            onClick={onPrint}
                                            disabled={isProcessing}
                                        >
                                            <Download className="w-3.5 h-3.5 mr-2" />
                                            {t("downloadInvoice")}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] text-zinc-500 text-center font-medium opacity-80">
                                            {t("secure")}
                                        </p>

                                        <div className="text-center">
                                            <a href="/support" target="_blank" className="text-[11px] text-zinc-500 hover:text-zinc-300 underline decoration-zinc-800 underline-offset-2 hover:decoration-zinc-600 transition-all font-medium">
                                                {t("problem")}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
