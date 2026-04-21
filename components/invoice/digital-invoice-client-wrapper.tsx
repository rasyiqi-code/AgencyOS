"use client";

import { useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import { Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentSelector } from "@/components/payment/payment-selector";
import type { BankDetails, MidtransPaymentData, PaymentMetadata } from "@/types/payment";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface DigitalOrder {
    id: string;
    amount: number;
    status: string; // 'PENDING', 'PAID', 'CANCELLED'
    userId: string | null;
    userName: string | null;
    userEmail: string;
    createdAt: Date;
    paymentMetadata: PaymentMetadata | null;
    product: {
        name: string;
        price: number;
        purchaseType: string;
        fileUrl: string | null;
        image: string | null;
    };
    license: {
        key: string;
    } | null;
}

interface DigitalInvoiceClientWrapperProps {
    order: DigitalOrder;
    isPaid: boolean;
    bankDetails: BankDetails;
    agencySettings?: {
        agencyName: string;
        companyName: string;
        address: string;
        email: string;
        phone?: string | null;
        telegram?: string | null;
        website?: string | null;
    };
    hasActiveGateway?: boolean;
    userMethod?: { name?: string | null; displayName?: string | null; email?: string | null } | null;
}

const thankYouQuotes = [
    "“The future belongs to those who believe in the beauty of their dreams.” — Eleanor Roosevelt",
    "“Innovation distinguishes between a leader and a follower.” — Steve Jobs",
    "“The best way to predict the future is to create it.” — Peter Drucker",
    "“Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.” — Steve Jobs",
    "“Technology is best when it brings people together.” — Matt Mullenweg"
];

import { useTranslations } from "next-intl";

export function DigitalInvoiceClientWrapper({ order, isPaid, bankDetails, agencySettings, hasActiveGateway = true, userMethod }: DigitalInvoiceClientWrapperProps) {
    const t = useTranslations("Invoice");
    const tc = useTranslations("Checkout");
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);

    // Dynamic Company Info from Settings
    const agencyName = agencySettings?.agencyName || "Agency OS";
    const website = agencySettings?.website || process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') || "agencyos.id";
    const billingEmail = agencySettings?.email || "billing@crediblemark.com";

    // Quote logic
    const quote = useMemo(() => {
        const index = order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % thankYouQuotes.length;
        return thankYouQuotes[index];
    }, [order.id]);

    // Polling payment status
    useEffect(() => {
        if (isPaid) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/digital-payment/status?orderId=${order.id}&mode=json`);
                const data = await res.json();

                if (data.status === 'PAID') {
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

    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Left Column: Invoice Document */}
            <div className="flex-1 w-full order-2 xl:order-1">
                {/* Header Info Mobile */}
                <div className="mb-6 flex justify-between items-center xl:hidden">
                    <h1 className="text-xl font-bold text-white">{t('invoiceNumber')}{order.id}</h1>
                    {isPaid && <span className="text-emerald-400 font-bold border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">{t('paid')}</span>}
                </div>

                <div className="bg-white text-black rounded-lg shadow-2xl overflow-hidden min-h-[800px] relative">
                    {/* Print Styles */}
                    <style jsx global>{`
                        @media print {
                            @page { margin: 2cm; size: auto; }
                            body { background: white !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                            .print-hidden { display: none !important; }
                        }
                    `}</style>

                    {/* Invoice Document Content */}
                    <div ref={componentRef} className="p-12 bg-white text-black h-full flex flex-col font-serif relative overflow-visible" id="invoice-doc">

                        {/* Watermark */}
                        {isPaid && (
                            <div className="absolute top-12 right-12 z-0 pointer-events-none opacity-20 transform -rotate-12 watermark-container">
                                <div className="border-[8px] border-[#FED700] text-[#FED700] font-black text-8xl px-12 py-4 tracking-widest uppercase rounded-xl border-double">
                                    {t('paid')}
                                </div>
                            </div>
                        )}

                        {/* Refined Header (Kop) */}
                        <div className="pb-8 mb-4 relative z-10">
                            <div className="flex justify-between items-baseline">
                                <div className="flex items-end gap-4">
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                        style={{ height: 'auto', width: 'auto' }}
                                        sizes="40px"
                                    />
                                    <h1 className="text-4xl font-black tracking-tighter leading-none text-[#D4AF37]">{agencyName}</h1>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-4xl font-black text-[#D4AF37] uppercase tracking-tighter leading-none select-none flex items-baseline justify-end relative -top-[6px]">
                                        <span className="mr-4 opacity-30 relative -top-[2px]">|</span>{t('title')}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex justify-between items-start mt-4 pt-4 border-t border-zinc-100/80">
                                <div className="flex justify-between items-start mt-4 pt-4 border-t border-b border-zinc-100/80 pb-4">
                                    <div className="text-sm text-zinc-600 max-w-xs leading-tight whitespace-pre-line text-left space-y-[1px]">
                                        <div className="font-bold text-zinc-900">{website}</div>
                                        <div className="text-zinc-500 font-medium text-[12px]">{billingEmail}</div>
                                    </div>
                                    <div className="text-right space-y-[1px]">
                                        <div className="flex justify-end items-baseline gap-[1px] text-[11px]">
                                            <span className="text-zinc-500 font-bold">{t('invoiceNo', { fallback: "No. Invoice" })}</span>
                                            <span className="font-mono font-bold text-zinc-900">#{order.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-end items-baseline gap-[1px] text-[11px]">
                                            <span className="text-zinc-500 font-bold">{t('dateIssued')}</span>
                                            <span className="font-bold text-zinc-900">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Client & Payment Info */}
                        <div className="mb-8 flex justify-between items-end relative z-10">
                            {/* Client Info Card */}
                            <div className="bg-white py-4 px-6 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100 min-w-[320px] text-left">
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{t('billTo')}</h3>
                                <p className="text-xl font-bold text-zinc-900 leading-tight">
                                    {order.userName || userMethod?.name || userMethod?.displayName || t('guestUser')}
                                </p>
                                <p className="text-zinc-500 text-sm font-medium mt-0.5">{order.userEmail}</p>
                            </div>

                            {/* Total Amount (Aligned with Card content) */}
                            <div className="flex flex-col justify-end items-end pr-2 pb-4">
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{t('totalAmount')}</h3>
                                <div className="text-4xl font-black text-[#D4AF37] tracking-tighter leading-none">
                                    <PriceDisplay amount={order.amount} />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full mb-4">
                            <thead>
                                <tr className="border-b border-zinc-200">
                                    <th className="text-left py-3 font-bold uppercase text-xs tracking-wider">{t('description')}</th>
                                    <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-32">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr>
                                    <td className="pt-6 pb-2 pr-4">
                                        <div className="font-bold text-lg">{order.product.name}</div>
                                    </td>
                                    <td className="pt-6 pb-2 text-right font-medium align-top">
                                        <PriceDisplay amount={order.amount} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Footer / Total */}
                        <div className="mt-auto border-t border-zinc-200 pt-8 flex justify-between items-start">
                            <div className="relative">
                            </div>
                            <div className="w-64">
                                <div className="flex justify-between mb-1">
                                    <span className="text-zinc-500">{t('subtotal')}</span>
                                    <span className="font-medium"><PriceDisplay amount={order.amount} /></span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-zinc-500">{t('tax')} (0%)</span>
                                    <span className="font-medium"><PriceDisplay amount={0} /></span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t border-zinc-200 pt-2">
                                    <span>{t('total')}</span>
                                    <span><PriceDisplay amount={order.amount} /></span>
                                </div>
                            </div>
                        </div>

                        {/* License Section if Paid (Print only or Bottom) */}
                        {isPaid && order.license && (
                            <div className="mt-12 pt-8 border-t border-dashed border-zinc-300 print:hidden">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">{t('digitalAccess')}</h4>
                                <div className="bg-emerald-50 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-full border border-emerald-100 shadow-sm">
                                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">{t('licenseKey')}</div>
                                            <div className="font-mono font-bold text-lg text-emerald-900">{order.license.key}</div>
                                        </div>
                                    </div>
                                    {order.product.fileUrl && (
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                                            <a href={order.product.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4 mr-2" />
                                                {t('downloadFiles')}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="text-center text-xs text-zinc-400 mt-12 pb-8 flex flex-col items-center gap-2">
                            <div>
                                {isPaid ? t('thankYouPaid') : t('thankYouDigital')}
                                {!isPaid && bankDetails && bankDetails.bank_account && (
                                    <span className="ml-2 pl-2 border-l border-zinc-200 inline-flex items-center gap-2">
                                        <span className="text-zinc-900 font-bold">{bankDetails.bank_name}</span>
                                        <span className="font-mono font-bold text-zinc-900">{bankDetails.bank_account}</span>
                                        <span className="text-zinc-500">a.n {bankDetails.bank_holder}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Sidebar */}
            <div className="w-full xl:w-[400px] xl:sticky xl:top-24 space-y-6 order-1 xl:order-2 print:hidden">
                {/* Status Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">{t('status')}</h2>
                            <p className="text-zinc-400 text-xs">#{order.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                            {isPaid ? t('paid') : t('unpaid')}
                        </div>
                    </div>

                    {!isPaid && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-zinc-300">{tc('totalToPay')}</span>
                                <span className="text-xl font-bold text-white">
                                    <PriceDisplay amount={order.amount} />
                                </span>
                            </div>

                            {!hasActiveGateway && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs font-semibold text-amber-500 mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        {tc('manualPayment')}
                                    </p>
                                    <p className="text-[10px] text-amber-200/70 leading-relaxed">
                                        {tc('manualDesc')}
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-zinc-500">
                                {t('completePaymentDigital')}
                            </p>
                        </div>
                    )}

                    {isPaid && (
                        <div className="text-center py-4 space-y-4">
                            <div>
                                <div className="text-emerald-400 font-medium mb-2">{t('paymentReceived')}</div>
                                <p className="text-xs text-zinc-500">{t('thankYouPurchase')}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <a href="/support" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1">
                            {t('needHelp')}
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
                            {t('downloadPrint')}
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

                {/* Payment Selector */}
                {!isPaid && (
                    <PaymentSelector
                        orderId={order.id}
                        amount={order.amount}
                        paymentMetadata={order.paymentMetadata as unknown as MidtransPaymentData}
                        chargeEndpoint="/api/digital-payment/charge"
                        bankDetails={bankDetails}
                        contactWA={agencySettings?.phone}
                        contactTele={agencySettings?.telegram}
                    />
                )}

                {!isPaid && (
                    <p className="text-center text-xs text-zinc-500">
                        {tc('secure')}
                    </p>
                )}
            </div>
        </div>
    );
}
