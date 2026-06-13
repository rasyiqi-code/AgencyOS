"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslations } from "next-intl";

interface MagicDraftPopoverProps {
    prompt: string;
    setPrompt: (value: string) => void;
    isGenerating: boolean;
    onGenerate: () => Promise<void>;
    align?: "start" | "end" | "center";
    children: React.ReactNode;
}

/**
 * Komponen Popover untuk fitur Magic Draft (AI Assistant)
 * Digunakan untuk menghindari duplikasi kode popover Magic Draft di form service.
 */
export function MagicDraftPopover({
    prompt,
    setPrompt,
    isGenerating,
    onGenerate,
    align = "start",
    children
}: MagicDraftPopoverProps) {
    const tAdmin = useTranslations("Admin.Services");

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent 
                className="w-80 p-0 border-indigo-500/20 bg-zinc-900 shadow-2xl shadow-indigo-500/20" 
                align={align}
            >
                <div className="p-4 border-b border-white/5 bg-indigo-500/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-semibold text-white text-sm">Magic Draft</h4>
                    </div>
                    <p className="text-[10px] text-indigo-300/80">
                        Describe update ideas and let AI draft the details.
                    </p>
                </div>
                <div className="p-4 space-y-4">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Add a premium tier with 24/7 support and custom icons..."
                        className="bg-black/40 border-indigo-500/20 text-zinc-200 focus:ring-indigo-500/40 min-h-[100px] text-xs resize-none"
                    />
                    <Button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 h-9 transition-all active:scale-95"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Drafting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Update Draft with AI
                            </>
                        )}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
