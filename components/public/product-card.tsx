"use client";

import { useState } from "react";
import { Sparkles, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "@/components/providers/currency-provider";

/**
 * Interface untuk props ProductCard.
 * Mengikuti struktur data dari DigitalProduct Prisma model.
 */
interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price: number;
        purchaseType: string;
        interval: string | null;
        image: string | null;
        type: string;
    };
}

/**
 * ProductCard — Komponen card produk digital dengan desain premium
 * mengikuti style ServiceCard (glassmorphism, spotlight effect, dll).
 */
export function ProductCard({ product }: ProductCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    /** Handler spotlight effect mengikuti posisi mouse */
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    /** Label badge berdasarkan tipe pembelian */
    const purchaseLabel = product.purchaseType === "subscription"
        ? (product.interval || "Monthly")
        : "One Time";

    return (
        <Link href={`/products/${product.slug}`}>
            <div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col h-full shadow-2xl"
            >
                {/* Interactive Glow Effect — spotlight mengikuti mouse */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(254, 215, 0, 0.1), transparent 40%)`,
                    }}
                />

                {/* Visual Block — Thumbnail / Placeholder */}
                <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-zinc-700" />
                        </div>
                    )}
                    {/* Gradient overlay dari bawah */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>

                {/* Content Block */}
                <div className="flex flex-col flex-grow p-4 md:p-5 relative z-10">
                    {/* Header: Badge + Title + Description */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            {/* Badge tipe pembelian */}
                            <div className="px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                                {purchaseLabel}
                            </div>
                            {/* Badge kategori produk */}
                            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {product.type}
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-brand-yellow transition-colors leading-tight mb-1">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 font-light">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Bottom: Price Block */}
                    <div className="mt-auto">
                        <div className="p-3 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10 flex items-center justify-between">
                            <div>
                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Price</div>
                                <div className="text-lg font-black text-white tracking-tighter">
                                    <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                                    {product.purchaseType === "subscription" && (
                                        <span className="text-xs font-normal text-zinc-500 ml-1">/{product.interval}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-brand-yellow text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                <Package className="w-4 h-4" />
                                Details
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
