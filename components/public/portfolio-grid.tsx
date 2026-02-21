"use client";

import { useState } from "react";
import { PortfolioCard } from "@/components/public/portfolio-card";
import { ScrollAnimationWrapper } from "@/components/ui/scroll-animation-wrapper";

interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    category?: string;
    html: string;
}

interface PortfolioGridProps {
    items: PortfolioItem[];
}

/**
 * Grid portfolio dengan filter category.
 * Menampilkan tombol filter di atas grid card untuk memfilter berdasarkan kategori.
 */
export function PortfolioGrid({ items }: PortfolioGridProps) {
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // Ekstrak daftar kategori unik dari portfolio items
    const categories = Array.from(
        new Set(items.map((item) => item.category || "Design"))
    );

    // Filter items berdasarkan kategori aktif
    const filteredItems =
        activeCategory === "all"
            ? items
            : items.filter((item) => (item.category || "Design") === activeCategory);

    return (
        <>
            {/* Category Filter Bar */}
            {categories.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                    {/* Tombol "Semua" */}
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 border ${activeCategory === "all"
                            ? "text-white border-white/30 shadow-lg"
                            : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                            }`}
                        style={activeCategory === "all" ? { backgroundColor: "#a67c00" } : undefined}
                    >
                        Semua
                    </button>

                    {/* Tombol per kategori */}
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 border ${activeCategory === cat
                                ? "text-white border-white/30 shadow-lg"
                                : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                                }`}
                            style={activeCategory === cat ? { backgroundColor: "#a67c00" } : undefined}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                {filteredItems.map((item, index) => (
                    <ScrollAnimationWrapper key={item.id} delay={index * 0.1}>
                        <PortfolioCard
                            title={item.title}
                            slug={item.slug}
                            category={item.category}
                            html={item.html}
                        />
                    </ScrollAnimationWrapper>
                ))}
            </div>

            {/* Empty state saat filter aktif */}
            {filteredItems.length === 0 && (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl mb-24">
                    <p className="text-zinc-500">Tidak ada portfolio untuk kategori ini.</p>
                </div>
            )}
        </>
    );
}
