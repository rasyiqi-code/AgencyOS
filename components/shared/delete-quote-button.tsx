"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteQuote } from "@/app/actions/quotes";

interface DeleteQuoteButtonProps {
    /** ID estimate yang akan dihapus */
    estimateId: string;
    /** ID user (opsional, untuk otorisasi client-side) */
    userId?: string;
    /** Ukuran tombol */
    size?: "sm" | "default" | "icon";
}

/**
 * Tombol hapus quote yang reusable untuk halaman client dan admin.
 * Menampilkan konfirmasi sebelum menghapus.
 */
export function DeleteQuoteButton({ estimateId, userId, size = "sm" }: DeleteQuoteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = () => {
        // Konfirmasi sebelum hapus
        const confirmed = window.confirm("Apakah Anda yakin ingin menghapus quote ini? Tindakan ini tidak dapat dibatalkan.");
        if (!confirmed) return;

        setError(null);
        startTransition(async () => {
            const result = await deleteQuote(estimateId, userId);
            if (result.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="inline-flex items-center gap-1">
            <Button
                type="button"
                variant="ghost"
                size={size}
                onClick={handleDelete}
                disabled={isPending}
                className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8"
                title="Hapus quote"
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </Button>
            {error && (
                <span className="text-xs text-red-400">{error}</span>
            )}
        </div>
    );
}
