"use client";

import { format } from "date-fns";
import Image from "next/image";

import { ExtendedEstimate } from "@/lib/types";

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
    agencySettings
}: {
    estimate: ExtendedEstimate,
    refAction?: React.RefObject<HTMLDivElement | null>,
    user?: { displayName?: string | null, email?: string | null } | null,
    isPaid?: boolean,
    agencySettings?: AgencyInvoiceSettings
}) {
    const today = new Date(); // Hydration safe as long as date doesn't change during render

    // Fallback values
    const agencyName = agencySettings?.agencyName || "Agency OS";
    const companyName = agencySettings?.companyName || "Agency OS";
    const address = agencySettings?.address || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000";
    const billingEmail = agencySettings?.email || "billing@crediblemark.com";

    return (
        <div ref={refAction} className="p-12 bg-white text-black h-full flex flex-col font-serif relative overflow-hidden" id="invoice-doc">
            {/* Watermark */}
            {isPaid && (
                <div className="absolute top-12 right-12 z-0 pointer-events-none opacity-20 transform -rotate-12">
                    <div className="border-[8px] border-emerald-500 text-emerald-500 font-black text-8xl px-12 py-4 tracking-widest uppercase rounded-xl border-double">
                        PAID
                    </div>
                </div>
            )}

            {/* Header */}

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">INVOICE</h1>
                    <p className="text-zinc-500 text-sm">#{estimate.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
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
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(estimate.totalCost)}
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
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(estimate.totalCost)}
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
                            <td className="py-4 text-right">${item.hours * 12}</td>
                        </tr>
                    ))}
                    {estimate.apis.map((item, i) => (
                        <tr key={`api-${i}`} className="border-b border-zinc-100">
                            <td className="py-4 pr-4">
                                <div className="font-bold">{item.title} (API)</div>
                                <div className="text-zinc-500 text-xs mt-1">{item.description}</div>
                            </td>
                            <td className="py-4 text-right">{item.hours}</td>
                            <td className="py-4 text-right">${item.hours * 12}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer / Total */}
            <div className="mt-auto border-t-2 border-black pt-8 flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between mb-2">
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="font-medium">${estimate.totalCost}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span className="text-zinc-500">Tax (0%)</span>
                        <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-zinc-200 pt-4">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(estimate.totalCost)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-zinc-400 mt-12 pb-8">
                Thank you for your business. Please process payment within 7 days.
            </div>
        </div>
    );
}
