"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { ExtendedEstimate, InvoiceItem } from "@/lib/shared/types";

export interface AgencyInvoiceSettings {
    agencyName: string;
    companyName: string;
    address: string;
    email: string;
}

export function InvoiceDocument({
    estimate: extendedEstimate,
    refAction,
    user,
    isPaid = false,
    agencySettings,
    paymentType,
    currency: propsCurrency,
    exchangeRate
}: {
    estimate: ExtendedEstimate,
    refAction?: React.RefObject<HTMLDivElement | null>,
    user?: { displayName?: string | null, email?: string | null } | null,
    isPaid?: boolean,
    agencySettings?: AgencyInvoiceSettings,
    paymentType?: string | null,
    currency?: string,
    exchangeRate?: number
}) {
    const t = useTranslations("Invoice");
    const tc = useTranslations("Checkout");
    const today = new Date();

    // Fallback values
    const companyName = agencySettings?.companyName || "Agency OS";
    const address = agencySettings?.address || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000";
    const billingEmail = agencySettings?.email || "billing@crediblemark.com";

    const currency = propsCurrency || 'USD';
    const formattedDate = format(today, "MMM dd, yyyy");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: currency === 'IDR' ? 0 : 2
        }).format(val * (currency === 'IDR' && exchangeRate ? exchangeRate : 1));
    };

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
                        position: fixed !important;
                        top: 12px;
                        right: 12px;
                    }
                }
            `}</style>
            {/* Watermark */}
            {(isPaid || paymentType === 'DP') && (
                <div className="absolute top-12 right-12 z-0 pointer-events-none opacity-20 transform -rotate-12 watermark-container">
                    <div className="border-[8px] border-[#FED700] text-[#FED700] font-black text-8xl px-12 py-4 tracking-widest uppercase rounded-xl border-double">
                        {paymentType === 'DP' ? 'DP' : t('paid')}
                    </div>
                </div>
            )}

            {/* Header */}

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2 flex items-center gap-3">
                        {t('title')}
                    </h1>
                    <p className="text-zinc-500 text-sm">#{extendedEstimate.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="mb-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="object-contain"
                            style={{ height: 'auto', width: 'auto' }}
                            sizes="64px"
                        />
                    </div>
                    <div className="font-bold text-xl mb-1">{companyName}</div>
                    <div className="text-zinc-500 text-sm whitespace-pre-line">
                        {address}<br />
                        {billingEmail}
                    </div>
                </div>
            </div>

            {/* Client Info */}
            <div className="mb-12 flex justify-between">
                <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t('billTo')}</h3>
                    <p className="text-lg font-bold">{user?.displayName || user?.email || t('valuedClient', { fallback: "Valued Client" })}</p>
                    <p className="text-zinc-500 text-sm">{user?.email}</p>
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{t('date')}</h3>
                        <p className="font-medium">{formattedDate}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{t('totalAmount')}</h3>
                        <p className="text-2xl font-bold text-zinc-900">
                            {formatCurrency(extendedEstimate.totalCost)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="text-left py-3 font-bold uppercase text-xs tracking-wider">{t('description')}</th>
                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-24">{t('hours')}</th>
                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-32">{t('amount')}</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {/* Service Specific Details */}
                    {extendedEstimate.service && (
                        <tr className="border-b border-zinc-100">
                            <td className="py-6 pr-4" colSpan={3}>
                                <div className="flex gap-6">
                                    {extendedEstimate.service.image && (
                                        <div className="relative w-32 h-32 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-200">
                                            <Image
                                                src={extendedEstimate.service.image}
                                                alt={extendedEstimate.service.title}
                                                fill
                                                className="object-cover"
                                                sizes="128px"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-bold text-lg mb-1">{extendedEstimate.service.title}</div>
                                        <div className="text-zinc-600 text-sm mb-4 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: extendedEstimate.service.description }} />

                                        {Array.isArray(extendedEstimate.service.features) && extendedEstimate.service.features.length > 0 && (
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {(extendedEstimate.service.features as unknown[]).map((feature: unknown, idx: number) => {
                                                    const text = typeof feature === 'string'
                                                        ? feature
                                                        : (feature as Record<string, string>).text || (feature as Record<string, string>).title || "";
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                            <span>{typeof text === 'string' ? text.replace(/<[^>]*>?/gm, '') : ''}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}

                    {extendedEstimate.screens.length === 0 && extendedEstimate.apis.length === 0 && (
                        <tr className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{extendedEstimate.title.replace('Invoice for ', '')}</div>
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
                                <div className="text-zinc-500 text-xs mt-1">{item.description}</div>
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">{formatCurrency(item.hours * 12)}</td>
                        </tr>
                    ))}
                    {extendedEstimate.apis.map((item: InvoiceItem, i: number) => (
                        <tr key={`api-${i}`} className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{item.title} (API)</div>
                                <div className="text-zinc-500 text-xs mt-1">{item.description}</div>
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">{formatCurrency(item.hours * 12)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer / Total */}
            <div className="mt-auto border-t-2 border-black pt-8 flex justify-between items-start">
                <div className="relative">
                    {(isPaid || paymentType === 'DP') && (
                        <div className="opacity-80 transform -rotate-12 transform-gpu">
                            <Image
                                src="/stamp.png"
                                alt="Official Stamp"
                                width={120}
                                height={120}
                                className="object-contain grayscale-[0.2]"
                                style={{ height: 'auto', width: 'auto' }}
                                sizes="120px"
                            />
                        </div>
                    )}
                </div>
                <div className="w-64">
                    <div className="flex justify-between mb-2">
                        <span className="text-zinc-500">{t('subtotal')}</span>
                        <span className="font-medium">{formatCurrency(extendedEstimate.totalCost)}</span>
                    </div>
                    {(paymentType === 'DP' || paymentType === 'REPAYMENT') && (
                        <div className="flex justify-between mb-2 text-indigo-600 font-medium">
                            <span className="flex items-center gap-1">
                                {paymentType === 'DP' ? tc('dp') : tc('repayment')}
                                {(paymentType === 'REPAYMENT' || (paymentType === 'DP' && isPaid)) && (
                                    <span className="ml-1 text-[10px] font-bold text-emerald-600 border border-emerald-600 px-1 rounded">{t('paid')}</span>
                                )}
                            </span>
                            <span>-{formatCurrency(extendedEstimate.totalCost * 0.5)}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-1">
                        <span className="text-zinc-500">{t('tax')} (0%)</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-zinc-200 pt-4">
                        <span>{(paymentType === 'DP' || paymentType === 'REPAYMENT') ? tc('totalToPay') : t('total')}</span>
                        <span>{formatCurrency((paymentType === 'DP' || paymentType === 'REPAYMENT') ? extendedEstimate.totalCost * 0.5 : extendedEstimate.totalCost)}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-2 text-right uppercase tracking-widest">
                        {t('grandTotal')}: {formatCurrency(extendedEstimate.totalCost)}
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-zinc-400 mt-12 pb-8">
                {isPaid ? t('thankYouPaid') : t('thankYou')}
            </div>
        </div>
    );
}
