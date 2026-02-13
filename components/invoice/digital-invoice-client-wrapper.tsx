"use client";

import { useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import { Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentSelector } from "@/components/payment/payment-selector";
import type { BankDetails } from "@/types/payment";

interface DigitalOrder {
    id: string;
    amount: number;
    status: string; // 'PENDING', 'PAID', 'CANCELLED'
    userId: string | null;
    userName: string | null;
    userEmail: string;
    createdAt: Date;
    paymentMetadata: any;
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

export function DigitalInvoiceClientWrapper({ order, isPaid, bankDetails, agencySettings, hasActiveGateway = true, userMethod }: DigitalInvoiceClientWrapperProps) {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);

    // Dynamic Company Info from Settings
    const companyName = agencySettings?.companyName || "Agency OS";
    const address = agencySettings?.address || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000";
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
                const res = await fetch(`/api/digital-payment/status?orderId=${order.id}`);
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
                    <h1 className="text-xl font-bold text-white">Invoice #{order.id}</h1>
                    {isPaid && <span className="text-emerald-400 font-bold border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">PAID</span>}
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
                                    PAID
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div>
                                <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2 flex items-center gap-3">
                                    INVOICE
                                </h1>
                                <p className="text-zinc-500 text-sm">#{order.id}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="mb-2">
                                    {/* Logo Placeholder - assuming logo.png exists as in service invoice */}
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={64}
                                        height={64}
                                        className="object-contain"
                                        style={{ height: 'auto' }}
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
                                <p className="text-lg font-bold">
                                    {order.userName || userMethod?.name || userMethod?.displayName || "Guest User"}
                                </p>
                                <p className="text-zinc-500 text-sm">{order.userEmail}</p>
                            </div>
                            <div className="text-right">
                                <div className="mb-4">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Date Issued</h3>
                                    <p className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Amount</h3>
                                    <p className="text-2xl font-bold text-zinc-900">
                                        ${order.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full mb-12">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="text-left py-3 font-bold uppercase text-xs tracking-wider">Description</th>
                                    <th className="text-right py-3 font-bold uppercase text-xs tracking-wider w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-zinc-100">
                                    <td className="py-6 pr-4">
                                        <div className="font-bold text-lg mb-1">{order.product.name}</div>
                                        <div className="text-zinc-600 text-sm capitalize">
                                            {order.product.purchaseType ? order.product.purchaseType.replace('_', ' ') : 'One-time'} License
                                        </div>
                                    </td>
                                    <td className="py-6 text-right font-medium align-top">
                                        ${order.amount.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Footer / Total */}
                        <div className="mt-auto border-t-2 border-black pt-8 flex justify-between items-start">
                            <div className="relative">
                                {/* Stamp if Paid */}
                                {isPaid && (
                                    <div className="opacity-80 transform -rotate-12 transform-gpu">
                                        <Image
                                            src="/stamp.png"
                                            alt="Official Stamp"
                                            width={120}
                                            height={120}
                                            className="object-contain grayscale-[0.2]"
                                            style={{ height: 'auto' }}
                                            sizes="120px"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="w-64">
                                <div className="flex justify-between mb-2">
                                    <span className="text-zinc-500">Subtotal</span>
                                    <span className="font-medium">${order.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-zinc-500">Tax (0%)</span>
                                    <span className="font-medium">$0.00</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t border-zinc-200 pt-4">
                                    <span>Total</span>
                                    <span>${order.amount.toLocaleString()}</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 mt-2 text-right uppercase tracking-widest">
                                    Grand Total: ${order.amount.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* License Section if Paid (Print only or Bottom) */}
                        {isPaid && order.license && (
                            <div className="mt-12 pt-8 border-t border-dashed border-zinc-300 print:hidden">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Digital Product Access</h4>
                                <div className="bg-emerald-50 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-full border border-emerald-100 shadow-sm">
                                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1">License Key</div>
                                            <div className="font-mono font-bold text-lg text-emerald-900">{order.license.key}</div>
                                        </div>
                                    </div>
                                    {order.product.fileUrl && (
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                                            <a href={order.product.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Files
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="text-center text-xs text-zinc-400 mt-12 pb-8">
                            Thank you for your business. Please process payment within 24 hours.
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
                            <h2 className="text-lg font-bold text-white">Invoice Status</h2>
                            <p className="text-zinc-400 text-xs">#{order.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                            {isPaid ? "PAID" : "UNPAID"}
                        </div>
                    </div>

                    {!isPaid && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-zinc-300">Total Due</span>
                                <span className="text-xl font-bold text-white">
                                    ${order.amount.toLocaleString()}
                                </span>
                            </div>

                            {!hasActiveGateway && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs font-semibold text-amber-500 mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Metode Otomatis Belum Aktif
                                    </p>
                                    <p className="text-[10px] text-amber-200/70 leading-relaxed">
                                        Gateway pembayaran belum dikonfigurasi. Mohon gunakan transfer bank manual.
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-zinc-500">
                                Please complete payment below to access your digital product.
                            </p>
                        </div>
                    )}

                    {isPaid && (
                        <div className="text-center py-4 space-y-4">
                            <div>
                                <div className="text-emerald-400 font-medium mb-2">Payment Received</div>
                                <p className="text-xs text-zinc-500">Thank you for your purchase. Enjoy your product!</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <a href="/support" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1">
                            Need Help? Contact Support
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
                            Download / Print Invoice
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
                        paymentMetadata={order.paymentMetadata}
                        currency="IDR" // Force IDR for now
                        bankDetails={bankDetails}
                        chargeEndpoint="/api/digital-payment/charge"
                    />
                )}

                {!isPaid && (
                    <p className="text-center text-xs text-zinc-500">
                        Protected by 256-bit SSL encryption.
                    </p>
                )}
            </div>
        </div>
    );
}
