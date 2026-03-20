"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { LICENSE_SNIPPETS, LICENSE_SNIPPETS_ID } from "./constants";

export function LicenseSnippets({ isId }: { isId: boolean }) {
    const [copied, setCopied] = React.useState(false);

    const snippets = isId ? LICENSE_SNIPPETS_ID : LICENSE_SNIPPETS;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(isId ? "Berhasil disalin!" : "Copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Tabs defaultValue="nextjs" className="w-full">
            <TabsList className="bg-zinc-900/50 p-1 rounded-xl h-auto flex flex-wrap gap-1 border border-white/5 mb-6">
                <TabsTrigger value="nextjs" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all">Next.js</TabsTrigger>
                <TabsTrigger value="node" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all">Node.js</TabsTrigger>
                <TabsTrigger value="python" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all">Python</TabsTrigger>
                <TabsTrigger value="php" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all">PHP</TabsTrigger>
                <TabsTrigger value="flutter" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all">Flutter</TabsTrigger>
            </TabsList>

            {(Object.keys(snippets) as Array<keyof typeof snippets>).map((key) => (
                <TabsContent key={key} value={key} className="mt-0 outline-none">
                    <div className="relative group">
                        <pre className="p-6 rounded-2xl bg-black border border-white/5 text-xs font-mono text-zinc-400 overflow-x-auto whitespace-pre selection:bg-brand-yellow/20 leading-relaxed">
                            {snippets[key]}
                        </pre>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-3 right-3 h-8 w-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => copyToClipboard(snippets[key])}
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}
