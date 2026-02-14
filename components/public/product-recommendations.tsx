"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "@/components/providers/currency-provider";

/**
 * Interface produk untuk rekomendasi.
 */
interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    purchaseType: string;
    interval: string | null;
    image: string | null;
    type: string;
}

interface ProductRecommendationsProps {
    /** Produk yang direkomendasikan (di-exclude produk saat ini) */
    products: RecommendedProduct[];
    /** Heading section */
    title: string;
    /** Sub-heading */
    subtitle?: string;
}

/**
 * Komponen rekomendasi produk untuk cross-sell/upsell.
 * Menampilkan card produk lain dengan spotlight effect.
 */
export function ProductRecommendations({ products, title, subtitle }: ProductRecommendationsProps) {
    if (products.length === 0) return null;

    return (
        <div className="mt-16">
            {/* Section Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
                {subtitle && (
                    <p className="text-zinc-500 text-sm mt-2">{subtitle}</p>
                )}
            </div>

            {/* Grid Rekomendasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => (
                    <RecommendationCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

/**
 * Card individual untuk rekomendasi — compact version dari ProductCard.
 */
function RecommendationCard({ product }: { product: RecommendedProduct }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const purchaseLabel = product.purchaseType === "subscription"
        ? (product.interval || "Monthly")
        : "One Time";

    return (
        <Link href={`/products/${product.slug}`}>
            <div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col h-full"
            >
                {/* Spotlight Glow */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(254, 215, 0, 0.08), transparent 40%)`,
                    }}
                />

                {/* Mini Thumbnail */}
                <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-zinc-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow relative z-10">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-widest">
                            {purchaseLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {product.type}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-brand-yellow transition-colors mb-1 line-clamp-1">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-zinc-500 text-xs line-clamp-1 mb-3">{product.description}</p>
                    )}

                    {/* Price */}
                    <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="text-lg font-black text-white tracking-tighter">
                            <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                        </div>
                        <span className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            View →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
