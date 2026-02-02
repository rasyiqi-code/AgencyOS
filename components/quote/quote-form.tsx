"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RecentEstimates } from "@/components/quote/recent-estimates";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function QuoteForm({ isAdmin }: { isAdmin?: boolean }) {
    const router = useRouter();
    const t = useTranslations("PriceCalculator");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiAvailable, setAiAvailable] = useState(true);

    useState(() => {
        fetch("/api/system/keys/status")
            .then(res => res.json())
            .then(data => setAiAvailable(data.configured))
            .catch(() => setAiAvailable(false));
    });

    const handleGenerate = async () => {
        if (!prompt.trim() || !aiAvailable) return;
        setLoading(true);

        try {
            const res = await fetch("/api/estimates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Generation failed");

            toast.success(t("success"));
            router.push(`/price-calculator/${data.id}`);
        } catch (e) {
            console.error(e);
            toast.error(t("error"));
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[80vh]">

            <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 text-brand-yellow text-sm font-medium border border-brand-yellow/20 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>{t("badge")}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                    {t.rich("title", {
                        highlight: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow animate-gradient-x bg-[length:200%_auto]">{chunks}</span>,
                        br: () => <br />
                    })}
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                    {t("subtitle")}
                </p>
            </div>

            <div className="w-full max-w-2xl bg-zinc-900/50 p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                <Textarea
                    placeholder={t("placeholder")}
                    className="w-full min-h-[120px] bg-transparent border-none text-white placeholder:text-zinc-600 text-lg resize-none focus-visible:ring-0 p-4"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
                <div className="flex justify-between items-center px-4 pb-2 pt-2 border-t border-white/5">
                    <span className="text-xs text-zinc-600">
                        {t("poweredBy")}
                    </span>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim() || !aiAvailable}
                        className={`${aiAvailable ? 'bg-brand-yellow hover:bg-brand-yellow/90 text-black' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'} font-bold rounded-xl px-6 transition-all`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("analyzing")}
                            </>
                        ) : !aiAvailable ? (
                            "AI Not Configured"
                        ) : (
                            <>
                                {t("generate")}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <RecentEstimates isAdmin={isAdmin} />
        </div>
    );
}
