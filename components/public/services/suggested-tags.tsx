"use client";

import { Sparkles } from "lucide-react";

interface SuggestedTagsProps {
    onTagClick: (tag: string) => void;
    isId: boolean;
    servicesCount: number;
    tags: string[];
}

export function SuggestedTags({ onTagClick, isId, servicesCount, tags }: SuggestedTagsProps) {
    return (
        <div className="w-full max-w-md mx-auto mt-4 animate-in fade-in duration-500 delay-150">
            <div className="flex items-center justify-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-yellow/80 animate-pulse" />
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                    {isId 
                        ? `${servicesCount} layanan siap untuk mu, cari` 
                        : `${servicesCount} services ready for you, search`}
                </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => onTagClick(tag)}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-950 rounded-none transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow-brand-yellow/5"
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
