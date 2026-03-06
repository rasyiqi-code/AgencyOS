"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, FileText, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/components/providers/currency-provider";

interface InvoiceActionsProps {
    /** ID Estimate untuk referensi API dan preview */
    estimateId: string;
    /** Apakah user terkait memiliki email yang valid */
    hasEmail: boolean;
    clientName?: string;
    serviceTitle?: string;
    amount?: number;
    currency?: string;
}

/**
 * Komponen aksi invoice admin: Kirim Email, Preview Invoice, dan Copy Follow-up Script.
 * Preview menggunakan halaman checkout yang sudah me-render InvoiceDocument.
 */
export function InvoiceActions({
    estimateId,
    hasEmail,
    clientName = "Client",
    serviceTitle = "Service",
    amount = 0,
    currency = "IDR"
}: InvoiceActionsProps) {
    const t = useTranslations("Admin.Finance.Quotes");
    const { currency: contextCurrency, rate, locale: contextLocale } = useCurrency();
    const [isSending, setIsSending] = useState(false);

    /** Kirim invoice via email ke klien */
    async function handleSendEmail() {
        if (!hasEmail) {
            toast.error("User tidak memiliki email terdaftar.");
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch(`/api/invoices/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estimateId }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send invoice");
            }

            toast.success(data.message || "Invoice berhasil dikirim!");
        } catch (error) {
            console.error("Send invoice error:", error);
            toast.error(error instanceof Error ? error.message : "Gagal mengirim invoice.");
        } finally {
            setIsSending(false);
        }
    }

    /** Buka halaman checkout sebagai preview invoice (sudah render InvoiceDocument) */
    function handlePreview() {
        window.open(`/checkout/${estimateId}`, '_blank');
    }

    /** Copy follow-up script untuk dikirim via chat */
    function handleCopyScript() {
        const checkoutLink = `${window.location.origin}/checkout/${estimateId}`;

        let displayAmount = amount;
        const displayCurrency = contextCurrency;

        // Logic konversi sesuai dengan CurrencyProvider
        if (currency === 'USD' && displayCurrency === 'IDR') {
            displayAmount = amount * rate;
        } else if (currency === 'IDR' && displayCurrency === 'USD') {
            displayAmount = amount / rate;
        }

        const priceString = new Intl.NumberFormat(contextLocale, {
            style: 'currency',
            currency: displayCurrency,
            currencyDisplay: 'narrowSymbol',
            maximumFractionDigits: displayCurrency === 'IDR' ? 0 : 2,
            minimumFractionDigits: displayCurrency === 'IDR' ? 0 : 2,
        }).format(displayAmount);

        const script = t('followUpScript', {
            name: clientName,
            service: serviceTitle,
            price: priceString,
            link: checkoutLink
        });

        navigator.clipboard.writeText(script);
        toast.success("Script follow-up berhasil disalin!");
    }

    return (
        <div className="flex items-center gap-1.5">
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 flex items-center justify-center text-zinc-500 hover:text-brand-yellow hover:bg-brand-yellow/10 rounded-full transition-all active:scale-90"
                onClick={handleCopyScript}
                title={t('copyScriptLabel')}
            >
                <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 flex items-center justify-center text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all active:scale-90"
                onClick={handleSendEmail}
                disabled={isSending || !hasEmail}
                title={hasEmail ? "Kirim Invoice ke Email" : "Email klien tidak tersedia"}
            >
                {isSending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Mail className="h-3.5 w-3.5" />
                )}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all active:scale-90"
                onClick={handlePreview}
                title="Preview Invoice"
            >
                <FileText className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
