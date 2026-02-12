"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" value={url} readOnly className="bg-zinc-900 border-zinc-700 text-zinc-300 font-mono text-sm" />
            <Button type="button" size="icon" onClick={handleCopy} variant="outline" className="shrink-0 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );
}
