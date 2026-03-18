"use client";

import React from 'react';
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyAllButtonProps {
    isId: boolean;
    content: string;
}

export function CopyAllButton({ isId, content }: CopyAllButtonProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast.success(isId ? "Berhasil menyalin seluruh dokumentasi!" : "Full documentation copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-lg whitespace-nowrap"
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isId ? "Salin Seluruh Panduan" : "Copy Full Guide"}
        </button>
    );
}
