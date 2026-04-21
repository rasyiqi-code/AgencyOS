"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";


interface Promotion {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    ctaText: string | null;
    ctaUrl: string | null;
    couponCode: string | null;
    endDate: string | null;
}

export function PromoCard({ promotion }: { promotion: Promotion }) {
    const copyCoupon = () => {
        if (promotion.couponCode) {
            navigator.clipboard.writeText(promotion.couponCode);
            toast.success("Kode kupon disalin!");
        }
    };

    const isExpired = promotion.endDate && new Date(promotion.endDate) < new Date();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            viewport={{ once: true }}
            className="group relative mb-6 break-inside-avoid overflow-hidden rounded-[3px] border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500 hover:border-brand-yellow/50 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)]"
        >
            {/* Poster Image - Natural Height */}
            <div className="relative w-full overflow-hidden">
                <Image
                    src={promotion.imageUrl}
                    alt={promotion.title}
                    width={600}
                    height={800}
                    unoptimized
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105 object-cover"
                    loading="lazy"
                />

                
                {/* Shine Effect Trigger */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <motion.div 
                        animate={{ 
                            x: ['-100%', '200%'],
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            repeatDelay: 4,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    />
                </div>

                {/* Visual Interaction Prompt (Pulsing) */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-4 h-24 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                    <motion.div 
                        animate={{ opacity: [0.6, 1, 0.6], y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex flex-col items-center gap-1"
                    >
                        <span className="text-[9px] font-black text-brand-yellow uppercase tracking-[0.3em] [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">Lihat Detail</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow shadow-[0_0_12px_rgba(251,191,36,1)]" />
                    </motion.div>
                </div>


                {/* Status Badge - Floating */}
                {promotion.endDate && (
                    <div className="absolute top-4 left-4 z-20">
                        <Badge variant={isExpired ? "destructive" : "secondary"} className="backdrop-blur-md bg-black/60 border-brand-yellow/20 text-brand-yellow text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                            {isExpired ? "Expired" : `Ends ${new Date(promotion.endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}`}
                        </Badge>
                    </div>
                )}


                {/* Hover Overlay Content */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/95 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex flex-col items-center w-full max-w-[220px] translate-y-2 transition-transform duration-500 group-hover:translate-y-0 text-center">
                        {/* Title & Description Group */}
                        <div className="mb-5 space-y-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none group-hover:text-brand-yellow transition-colors">
                                {promotion.title}
                            </h3>
                            {promotion.description && (
                                <p className="text-[10px] leading-relaxed text-zinc-500 font-medium line-clamp-1">
                                    {promotion.description}
                                </p>
                            )}
                        </div>

                        {/* Subtle Divider */}
                        <div className="w-8 h-[1px] bg-brand-yellow/20 mb-5" />

                        {/* Actions Group */}
                        <div className="flex flex-col items-center gap-4 w-full">
                            {promotion.couponCode && (
                                <div 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        copyCoupon();
                                    }}
                                    className="group/coupon flex flex-col items-center gap-1.5 cursor-pointer w-full"
                                >
                                    <span className="text-[8px] font-bold text-brand-yellow/40 uppercase tracking-[0.3em]">Kode Kupon</span>
                                    <div className="w-full rounded-sm border border-dashed border-brand-yellow/30 bg-white/[0.03] py-2 transition-all group-hover/coupon:bg-brand-yellow/5 group-hover/coupon:border-brand-yellow/50">
                                        <span className="font-mono text-sm font-black tracking-[0.2em] text-brand-yellow">{promotion.couponCode}</span>
                                    </div>
                                </div>
                            )}

                            {promotion.ctaUrl && (
                                <Button asChild variant="default" className="w-full rounded-sm bg-brand-yellow hover:bg-white h-10 text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">
                                    <a href={promotion.ctaUrl} target={promotion.ctaUrl.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer">
                                        {promotion.ctaText || "Ambil Promo"}
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>



            </div>
        </motion.div>


    );
}


