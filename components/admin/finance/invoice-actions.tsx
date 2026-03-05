"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceActionsProps {
    /** ID Estimate untuk referensi API dan preview */
    estimateId: string;
    /** Apakah user terkait memiliki email yang valid */
    hasEmail: boolean;
}

/**
 * Komponen aksi invoice admin: Kirim Email dan Preview Invoice.
 * Preview menggunakan halaman checkout yang sudah me-render InvoiceDocument.
 */
export function InvoiceActions({ estimateId, hasEmail }: InvoiceActionsProps) {
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

    return (
        <div className="flex items-center gap-1">
            <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                onClick={handleSendEmail}
                disabled={isSending || !hasEmail}
                title={hasEmail ? "Kirim Invoice ke Email" : "Email klien tidak tersedia"}
            >
                {isSending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Mail className="h-3.5 w-3.5" />
                )}
                Email
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10"
                onClick={handlePreview}
                title="Preview Invoice"
            >
                <FileText className="h-3.5 w-3.5" />
                Invoice
            </Button>
        </div>
    );
}
