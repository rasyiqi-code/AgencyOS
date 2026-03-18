"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Check } from "lucide-react";
import { toast } from "sonner";

interface CopySectionButtonProps {
    isId: boolean;
    title: string;
    content: string;
}

export function CopySectionButton({ isId, title, content }: CopySectionButtonProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        const markdown = `# ${title}\n\n${content}`;
        navigator.clipboard.writeText(markdown);
        toast.success(isId ? "Bagian berhasil disalin!" : "Section copied!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="h-8 px-4 rounded-lg bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:text-white text-zinc-500 flex items-center gap-2 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
            {copied ? (
                <>
                    <Check className="w-3 h-3 text-emerald-500" /> 
                    {isId ? "Berhasil Disalin" : "Copied"}
                </>
            ) : (
                <>
                    <FileDown className="w-3 h-3" />
                    {isId ? "Salin Dokumentasi" : "Copy as Markdown"}
                </>
            )}
        </Button>
    );
}
