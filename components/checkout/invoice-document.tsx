"use client";

import { format } from "date-fns";
import Image from "next/image";

import { ExtendedEstimate } from "@/lib/shared/types";

export interface AgencyInvoiceSettings {
    agencyName: string;
    companyName: string;
    address: string;
    email: string;
}

export function InvoiceDocument({
    estimate,
    refAction,
    user,
    isPaid = false,
    agencySettings,
    paymentType,
    currency,
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
    const today = new Date(); // Hydration safe as long as date doesn't change during render

    // Fallback values
    const companyName = agencySettings?.companyName || "Agency OS";
    const address = agencySettings?.address || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000";
    const billingEmail = agencySettings?.email || "billing@crediblemark.com";

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
                        {paymentType === 'DP' ? 'DP' : 'PAID'}
                    </div>
                </div>
            )}

            {/* Header */}

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2 flex items-center gap-3">
                        INVOICE
                    </h1>
                    <p className="text-zinc-500 text-sm">#{estimate.id.slice(-8).toUpperCase()}</p>
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
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bill To</h3>
                    <p className="text-lg font-bold">{user?.displayName || user?.email || "Valued Client"}</p>
                    <p className="text-zinc-500 text-sm">{user?.email}</p>
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Date</h3>
                        <p className="font-medium">{format(today, "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Amount</h3>
                        <p className="text-2xl font-bold text-zinc-900">
                            {new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(estimate.totalCost * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="text-left py-3 font-bold uppercase text-xs tracking-wider">Description</th>
                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-24">Hours</th>
                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-32">Amount</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {/* Service Specific Details */}
                    {estimate.service && (
                        <tr className="border-b border-zinc-100">
                            <td className="py-6 pr-4" colSpan={3}>
                                <div className="flex gap-6">
                                    {estimate.service.image && (
                                        <div className="relative w-32 h-32 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-200">
                                            <Image
                                                src={estimate.service.image}
                                                alt={estimate.service.title}
                                                fill
                                                className="object-cover"
                                                sizes="128px"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-bold text-lg mb-1">{estimate.service.title}</div>
                                        <div className="text-zinc-600 text-sm mb-4 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: estimate.service.description }} />

                                        {Array.isArray(estimate.service.features) && estimate.service.features.length > 0 && (
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {(estimate.service.features as unknown[]).map((feature: unknown, idx: number) => {
                                                    const text = typeof feature === 'string'
                                                        ? feature
                                                        : (feature as Record<string, string>).text || (feature as Record<string, string>).title || "";
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                            <span>{text.replace(/<[^>]*>?/gm, '')}</span>
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

                    {estimate.screens.length === 0 && estimate.apis.length === 0 && (
                        <tr className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{estimate.title.replace('Invoice for ', '')}</div>
                                <div className="text-zinc-500 text-xs mt-1">{estimate.summary}</div>
                            </td>
                            <td className="py-4 text-right">-</td>
                            <td className="py-4 text-right">
                                {new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(estimate.totalCost * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}
                            </td>
                        </tr>
                    )}
                    {estimate.screens.map((item, i) => (
                        <tr key={`screen-${i}`} className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{item.title}</div>
                                <div className="text-zinc-500 text-xs mt-1">{item.description}</div>
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">{new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format((item.hours * 12) * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}</td>
                        </tr>
                    ))}
                    {estimate.apis.map((item, i) => (
                        <tr key={`api-${i}`} className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{item.title} (API)</div>
                                <div className="text-zinc-500 text-xs mt-1">{item.description}</div>
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">{new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format((item.hours * 12) * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}</td>
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
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="font-medium">{new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(estimate.totalCost * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}</span>
                    </div>
                    {(paymentType === 'DP' || paymentType === 'REPAYMENT') && (
                        <div className="flex justify-between mb-2 text-indigo-600 font-medium">
                            <span>
                                Down Payment (50%)
                                {(paymentType === 'REPAYMENT' || (paymentType === 'DP' && isPaid)) && (
                                    <span className="ml-2 text-[10px] font-bold text-emerald-600 border border-emerald-600 px-1 rounded">PAID</span>
                                )}
                            </span>
                            <span>-{new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format((estimate.totalCost * 0.5) * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-1">
                        <span className="text-zinc-500">Tax (0%)</span>
                        <span className="font-medium">{new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(0)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-zinc-200 pt-4">
                        <span>{(paymentType === 'DP' || paymentType === 'REPAYMENT') ? 'Total to Pay' : 'Total'}</span>
                        <span>{new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(
                            ((paymentType === 'DP' || paymentType === 'REPAYMENT') ? estimate.totalCost * 0.5 : estimate.totalCost) * (currency === 'IDR' && exchangeRate ? exchangeRate : 1)
                        )}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-2 text-right uppercase tracking-widest">
                        Grand Total: {new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(estimate.totalCost * (currency === 'IDR' && exchangeRate ? exchangeRate : 1))}
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-zinc-400 mt-12 pb-8">
                Thank you for your business. Please process payment within 7 days.
            </div>
        </div>
    );
}
