"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface RecentEstimate {
    id: string;
    title: string;
    totalHours: number;
    totalCost: number;
    createdAt: string | Date; // API returns string, but we handle Date too
    complexity: string;
    creatorName?: string | null;
}

export function RecentEstimates({ isAdmin }: { isAdmin?: boolean }) {
    const t = useTranslations("PriceCalculator");
    const [estimates, setEstimates] = useState<RecentEstimate[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const fetchEstimates = async (cursor?: string | null) => {
        try {
            const params = new URLSearchParams({ limit: "2" });
            if (cursor) params.append("cursor", cursor);

            const res = await fetch(`/api/estimates?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            if (cursor) {
                setEstimates(prev => [...prev, ...data.items]);
            } else {
                setEstimates(data.items);
            }
            setNextCursor(data.nextCursor);
        } catch (error) {
            console.error("Failed to fetch recent estimates:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchEstimates();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm(t("deleteConfirm"))) return;

        try {
            const res = await fetch(`/api/estimates?id=${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete");

            setEstimates(prev => prev.filter(e => e.id !== id));
            toast.success(t("deleteSuccess"));
        } catch {
            toast.error(t("deleteError"));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-lime-500 animate-spin" />
            </div>
        );
    }

    if (estimates.length === 0) return null;

    return (
        <div className="mt-16 w-full max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-lime-400" />
                <h2 className="text-xl font-bold text-white">{t("recentEstimates")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estimates.map((estimate) => (
                    <div key={estimate.id} className="group relative">
                        <Link
                            href={`/price-calculator/${estimate.id}`}
                            className="block p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-lime-500/50 hover:bg-zinc-800/80 transition-all group-hover:shadow-lg group-hover:shadow-lime-900/10"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-lime-400 transition-colors">
                                        {estimate.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {t("by")} {estimate.creatorName || t("anonymous")} • {formatDistanceToNow(new Date(estimate.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-lime-400 font-mono text-sm">
                                    <PriceDisplay amount={estimate.totalCost} baseCurrency="USD" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-zinc-400 mt-4 pt-4 border-t border-zinc-800/50">
                                <span className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${estimate.complexity === 'Simple' ? 'bg-green-500' :
                                        estimate.complexity === 'Medium' ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`} />
                                    {estimate.complexity} {t("complexity")}
                                </span>
                                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-white">
                                    {t("viewDetails")} <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </Link>

                        {isAdmin && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(estimate.id);
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Estimate"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {nextCursor && (
                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setLoadingMore(true);
                            fetchEstimates(nextCursor);
                        }}
                        disabled={loadingMore}
                        className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("loading")}
                            </>
                        ) : (
                            t("loadMore")
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
