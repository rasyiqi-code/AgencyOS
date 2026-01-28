"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface ServiceFeaturesListProps {
    features: unknown[];
    limit?: number;
    variant?: "default" | "admin";
}

export function ServiceFeaturesList({ features, limit = 4, variant = "default" }: ServiceFeaturesListProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!features || !Array.isArray(features)) return null;

    const hasMore = features.length > limit;
    const displayedFeatures = isExpanded ? features : features.slice(0, limit);

    if (variant === "admin") {
        return (
            <div className="space-y-1.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1 transition-all duration-300">
                    {(displayedFeatures as (string | { text?: string, title?: string })[]).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-500 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                            {typeof feature === 'string' ? feature.replace(/<[^>]*>?/gm, '') : (feature.text || feature.title || "").replace(/<[^>]*>?/gm, '')}
                        </div>
                    ))}
                </div>
                {hasMore && !isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-[9px] text-emerald-500/80 hover:text-emerald-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1 transition-colors group"
                    >
                        <Plus className="w-2.5 h-2.5 group-hover:scale-110 transition-transform" />
                        All {features.length} Features
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2 mt-2 transition-all duration-300">
            {(displayedFeatures as (string | { text?: string, title?: string })[]).map((feature, idx) => (
                <Badge key={idx} variant="outline" className="bg-white/5 border-white/5 text-[10px] text-zinc-500 px-2 py-0 animate-in fade-in zoom-in-95 duration-300">
                    {typeof feature === 'string' ? feature.replace(/<[^>]*>?/gm, '') : (feature.text || feature.title || "").replace(/<[^>]*>?/gm, '')}
                </Badge>
            ))}

            {hasMore && !isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="text-[10px] text-zinc-600 hover:text-white flex items-center px-1 transition-colors cursor-pointer"
                >
                    +{features.length - limit} more
                </button>
            )}
        </div>
    );
}
