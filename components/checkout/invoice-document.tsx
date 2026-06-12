"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale/id";
import { enUS as localeEn } from "date-fns/locale/en-US";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

import { ExtendedEstimate, InvoiceItem } from "@/lib/shared/types";
import { sanitizeHtml } from "@/lib/utils/sanitize";

import QRCode from "react-qr-code";
import type { BankDetails } from "@/types/payment";

export interface AgencyInvoiceSettings {
    agencyName: string;
    companyName: string;
    address: string;
    email: string;
    phone?: string | null;
    telegram?: string | null;
    website?: string | null;
}

function AuthenticitySticker({ id }: { id: string }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://crediblemark.com');
    const verificationUrl = `${appUrl}/verify/${id}`;
    // Generate a numeric-looking serial from the ID
    const serialNumber = id.split('').map(char => char.charCodeAt(0) % 10).join('').slice(0, 10);
    const formattedSerial = serialNumber.match(/.{1,5}/g)?.join(' ') || serialNumber;

    return (
        <div className="relative w-20 flex flex-col bg-white rounded-sm overflow-hidden rotate-[-1.5deg] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] border-r border-b border-zinc-200/50 transform hover:rotate-0 hover:scale-105 transition-all duration-300 print:rotate-[-1.5deg] print:shadow-none">
            {/* Satin Highlight Overlay (Physical Sticker Texture) */}
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20" />

            {/* Header: Black Section */}
            <div className="relative bg-black py-1 px-1 text-center z-10">
                <span className="text-[6px] font-black text-[#D4AF37] tracking-[0.2em] uppercase leading-none block">
                    OFFICIAL
                </span>
            </div>

            {/* Middle: QR Code Section */}
            <div className="relative p-1.5 bg-white flex flex-col items-center z-10">
                <div className="relative bg-white rounded-xs mb-1">
                    <QRCode
                        value={verificationUrl}
                        size={48}
                        level="H"
                        fgColor="#000000"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                </div>
                {/* Serial Number */}
                <div className="font-mono text-[7px] text-black tracking-tighter font-bold leading-none">
                    {formattedSerial}
                </div>
            </div>

            {/* Footer: Metallic Section */}
            <div className="relative bg-[#F3F4F6] py-1 px-1 overflow-hidden text-center z-10">
                {/* Holographic Shimmer Effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

                <div className="relative flex flex-col items-center">
                    <div className="text-black font-black text-[6px] uppercase tracking-tighter italic leading-none mb-0.5">
                        Scan To Verify
                    </div>
                    <div className="text-[5px] font-bold text-zinc-500 tracking-tight leading-none">
                        crediblemark.com
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite linear;
                }
            `}</style>
        </div>
    );
}

export function InvoiceDocument({
    estimate: extendedEstimate,
    refAction,
    user,
    isPaid = false,
    agencySettings,
    paymentType,
    currency: propsCurrency,
    exchangeRate,
    bankDetails
}: {
    estimate: ExtendedEstimate,
    refAction?: React.RefObject<HTMLDivElement | null>,
    user?: { displayName?: string | null, email?: string | null } | null,
    isPaid?: boolean,
    agencySettings?: AgencyInvoiceSettings,
    paymentType?: string | null,
    currency?: string,
    exchangeRate?: number,
    bankDetails?: BankDetails
}) {
    const t = useTranslations("Invoice");
    const tc = useTranslations("Checkout");
    const today = new Date();

    // Fallback values
    const agencyName = agencySettings?.agencyName || "Agency OS";
    const website = agencySettings?.website || process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') || "agencyos.id";
    const billingEmail = agencySettings?.email || "billing@crediblemark.com";

    const locale = useLocale();
    const currency = propsCurrency || 'USD';
    const dateLocale = locale === 'id' ? localeId : localeEn;
    const formattedDate = format(today, locale === 'id' ? "d MMMM yyyy" : "MMM dd, yyyy", { locale: dateLocale });

    const baseCurrency = extendedEstimate.service?.currency || 'USD';
    const formatCurrency = (val: number) => {
        const targetCurrency = currency;
        const isTargetIDR = targetCurrency === 'IDR';
        const isBaseIDR = baseCurrency === 'IDR';

        let convertedVal = val;
        // Logic: Only convert if base and target are different
        if (isBaseIDR && !isTargetIDR) {
            // IDR Base -> USD View: Divide by rate
            convertedVal = val / (exchangeRate || 15000);
        } else if (!isBaseIDR && isTargetIDR) {
            // USD Base -> IDR View: Multiply by rate
            convertedVal = val * (exchangeRate || 15000);
        }

        return new Intl.NumberFormat(isTargetIDR ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: targetCurrency,
            maximumFractionDigits: isTargetIDR ? 0 : 2
        }).format(convertedVal);
    };

    const totalToPay = (paymentType === 'DP' || paymentType === 'REPAYMENT') ? extendedEstimate.totalCost * 0.5 : extendedEstimate.totalCost;

    return (
        <div ref={refAction} className="p-12 bg-white text-black h-full flex flex-col font-serif relative overflow-visible print:overflow-visible print:p-0 print:m-0" id="invoice-doc">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 2cm;
                        size: auto;
                    }
                    body {
                        background: white !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    #invoice-doc {
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                        width: 100% !important;
                    }
                    /* Ensure second page has margin when content breaks */
                    tr {
                        break-inside: avoid;
                    }
                    .watermark-container {
                        position: absolute !important;
                        inset: 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        z-index: 50 !important;
                    } 
                }
            `}</style>
            {/* Watermark - shows status label for all invoice states */}
            {(() => {
                let label = '';
                let color = '#999';

                if (isPaid) {
                    label = 'PAID';
                    color = '#FED700'; // Gold for paid
                } else if (paymentType === 'DP') {
                    label = 'DP';
                    color = '#FED700';
                } else {
                    label = 'UNPAID';
                    color = '#EF4444'; // Red for unpaid
                }

                return (
                    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center watermark-container">
                        <div
                            className="font-black text-8xl px-12 py-4 tracking-widest uppercase rounded-xl border-double opacity-[0.12] transform -rotate-[25deg]"
                            style={{ border: `8px double ${color}`, color }}
                        >
                            {label}
                        </div>
                    </div>
                );
            })()}

            {/* Header */}

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

                <div className="flex justify-between items-start mt-4 pt-4 border-t border-b border-zinc-100/80 pb-4">
                    <div className="text-sm text-zinc-600 max-w-xs leading-tight whitespace-pre-line space-y-[1px]">
                        <div className="font-bold text-zinc-900">{website}</div>
                        <div className="text-zinc-500 font-medium text-[12px]">{billingEmail}</div>
                    </div>
                    <div className="text-right space-y-[1px]">
                        <div className="flex justify-end items-baseline gap-[1px] text-[11px]">
                            <span className="text-zinc-500 font-bold">{t('invoiceNo', { fallback: "No. Invoice" })}</span>
                            <span className="font-mono font-bold text-zinc-900">#{extendedEstimate.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-end items-baseline gap-[1px] text-[11px]">
                            <span className="text-zinc-500 font-bold">{t('date')}</span>
                            <span className="font-bold text-zinc-900">{formattedDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client & Payment Info */}
            <div className="mb-8 flex justify-between items-end relative z-10">
                {/* Client Info Card */}
                <div className="bg-white py-4 px-6 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100 min-w-[320px]">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{t('billTo')}</h3>
                    <p className="text-xl font-bold text-zinc-900 leading-tight">{user?.displayName || user?.email || t('valuedClient', { fallback: "Valued Client" })}</p>
                    <p className="text-zinc-500 text-sm font-medium mt-0.5">{user?.email}</p>
                </div>

                {/* Total Amount (Aligned with Card content) */}
                <div className="flex flex-col justify-end items-end pr-2 pb-4">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{t('totalAmount')}</h3>
                    <p className="text-4xl font-black text-[#D4AF37] tracking-tighter leading-none">
                        {formatCurrency(extendedEstimate.totalCost)}
                    </p>
                </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-zinc-200">
                        <th className="text-left py-3 font-bold uppercase text-xs tracking-wider">{t('description')}</th>
                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-24">{t('hours')}</th>
                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-32">{t('amount')}</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {/* Service Specific Details */}
                    {extendedEstimate.service && (
                        <tr>
                            <td className="pt-6 pb-2 pr-4">
                                <div className="font-bold text-lg">{extendedEstimate.service.title}</div>
                            </td>
                            <td className="pt-6 pb-2 text-right align-top">-</td>
                            <td className="pt-6 pb-2 text-right align-top">
                                {formatCurrency(extendedEstimate.totalCost)}
                            </td>
                        </tr>
                    )}

                    {/* Fallback line item - only when no service detail block */}
                    {!extendedEstimate.service && extendedEstimate.screens.length === 0 && extendedEstimate.apis.length === 0 && (
                        <tr className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{extendedEstimate.title.replace(/^(Invoice: |Invoice for |Draft Quote for |Quote: |Quote Request: )/i, '')}</div>
                                <div className="text-zinc-500 text-xs mt-1">{extendedEstimate.summary}</div>
                            </td>
                            <td className="py-4 text-right">-</td>
                            <td className="py-4 text-right">
                                {formatCurrency(extendedEstimate.totalCost)}
                            </td>
                        </tr>
                    )}
                    {extendedEstimate.screens.map((item: InvoiceItem, i: number) => (
                        <tr key={`screen-${i}`} className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{item.title}</div>
                                <div className="text-zinc-500 text-xs mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description || "") }} />
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">{formatCurrency(item.hours * 12)}</td>
                        </tr>
                    ))}
                    {extendedEstimate.apis.map((item: InvoiceItem, i: number) => (
                        <tr key={`api-${i}`} className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{item.title} (API)</div>
                                <div className="text-zinc-500 text-xs mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description || "") }} />
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">{formatCurrency(item.hours * 12)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer / Total */}
            <div className="mt-auto border-t border-zinc-200 pt-8 flex justify-between items-start">
                <div className="relative">
                    <AuthenticitySticker id={extendedEstimate.id} />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between w-64 text-sm text-zinc-500">
                        <span>{t('subtotal')}</span>
                        <span className="font-medium text-zinc-900">{formatCurrency(extendedEstimate.totalCost)}</span>
                    </div>
                    {(paymentType === 'DP' || paymentType === 'REPAYMENT') && (
                        <div className="flex justify-between w-64 text-sm text-indigo-600 font-medium">
                            <span className="flex items-center gap-1">
                                {paymentType === 'DP' ? tc('dp') : tc('repayment')}
                                {(paymentType === 'REPAYMENT' || (paymentType === 'DP' && isPaid)) && (
                                    <span className="ml-1 text-[10px] font-bold text-emerald-600 border border-emerald-600 px-1 rounded">{t('paid')}</span>
                                )}
                            </span>
                            <span>-{formatCurrency(extendedEstimate.totalCost * 0.5)}</span>
                        </div>
                    )}
                    <div className="flex justify-between w-64 text-sm text-zinc-500">
                        <span>{t('tax')} (0%)</span>
                        <span className="font-medium text-zinc-900">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between w-64 text-xl font-bold border-t border-zinc-200 pt-2">
                        <span>{(paymentType === 'DP' || paymentType === 'REPAYMENT') ? tc('totalToPay') : t('total')}</span>
                        <span>{formatCurrency(totalToPay)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-zinc-400 mt-12 pb-8 flex flex-col items-center gap-2">
                <div>
                    {isPaid ? t('thankYouPaid') : t('thankYou')}
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
    );
}
