"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
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

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * ProductCard — Komponen card produk digital dengan desain premium
 * mengikuti style ServiceCard (glassmorphism, spotlight effect, dll).
 */
export function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations("Cards");
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
        ? (product.interval || t("monthly"))
        : t("oneTime");

    return (
        <Link href={`/products/${product.slug}`} className="h-full block">
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="group relative rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col h-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
            >
                {/* Shine Sweep Effect */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: "200%", opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-20deg]"
                        />
                    )}
                </AnimatePresence>

                {/* Interactive Glow Effect — spotlight mengikuti mouse */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-10"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(254, 215, 0, 0.08), transparent 40%)`,
                    }}
                />

                {/* Visual Block — Thumbnail / Placeholder */}
                <div className="relative aspect-square overflow-hidden shrink-0">
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80" />
                    
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/80 to-zinc-900 flex items-center justify-center">
                            <motion.div
                                animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 blur-2xl bg-brand-yellow/20" />
                                <Sparkles className="w-10 h-10 text-brand-yellow/40 relative z-10" />
                            </motion.div>
                        </div>
                    )}

                    {/* Status Badge Overlays */}
                    <div className="absolute top-3 left-3 z-30 flex flex-wrap gap-1.5">
                        <div className="px-2 py-0.5 rounded-full bg-brand-yellow/10 backdrop-blur-md border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-widest">
                            {purchaseLabel}
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                            {product.type}
                        </div>
                    </div>
                </div>

                {/* Content Block */}
                <div className="flex flex-col flex-grow p-4 relative z-10 justify-center">
                    <div className="py-1 text-center mb-4">
                        <h3 className="text-lg font-black text-white group-hover:text-brand-yellow transition-colors leading-[1.1] tracking-tight line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    {/* Bottom: Price Block */}
                    <div className="mt-auto">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 group-hover:border-brand-yellow/20 transition-all duration-500 flex items-center justify-between overflow-hidden relative">
                            {/* Inner Glow on Price box */}
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-yellow/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em]">{t("price")}</div>
                                    <div className="text-xl font-black text-white tracking-tighter flex items-baseline">
                                        <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                                        {product.purchaseType === "subscription" && (
                                            <span className="text-[10px] font-medium text-zinc-500 ml-1 opacity-60">/{product.interval}</span>
                                        )}
                                    </div>
                                </div>

                                <motion.div 
                                    animate={isHovered ? { x: 0, opacity: 1 } : { x: 5, opacity: 0 }}
                                    className="flex items-center gap-2 text-brand-yellow text-sm font-black uppercase tracking-widest"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
