"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function QuoteForm() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);

        try {
            const res = await fetch("/api/estimates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Generation failed");

            toast.success("Estimate generated!");
            router.push(`/price-calculator/${data.id}`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate estimate. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[80vh]">

            <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 text-lime-500 text-sm font-medium border border-lime-500/20 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>Quote & Pricing</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                    Build your software <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">
                        with absolute clarity.
                    </span>
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                    Describe your idea in your own words. Get a detailed breakdown, timeline, and fixed price quote in seconds.
                </p>
            </div>

            <div className="w-full max-w-2xl bg-zinc-900/50 p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                <Textarea
                    placeholder="I want to build a marketplace for vintage watches where users can bid..."
                    className="w-full min-h-[120px] bg-transparent border-none text-white placeholder:text-zinc-600 text-lg resize-none focus-visible:ring-0 p-4"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
                <div className="flex justify-between items-center px-4 pb-2 pt-2 border-t border-white/5">
                    <span className="text-xs text-zinc-600">
                        Powered by Gemini 2.0 Flash
                    </span>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl px-6 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Generate Estimate
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Example prompts or social proof could go here */}

        </div>
    );
}
