"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/store/purchase-button";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { Sparkles, ChevronDown } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { useTranslations, useLocale } from "next-intl";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceModalContent, type Service } from "@/components/public/service-modal-content";
import { Check } from "lucide-react";

interface ProductListProps {
    initialServices: Service[];
}

export function ProductList({ initialServices }: ProductListProps) {
    const t = useTranslations("ProductCatalog");
    const locale = useLocale();
    const isId = locale === 'id';

    // State for Load More
    const [visibleCount, setVisibleCount] = useState(3);

    const visibleServices = initialServices.slice(0, visibleCount);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12"
            >
                {visibleServices.map((service) => {
                    const title = (isId && service.title_id) ? service.title_id : service.title;
                    const desc = (isId && service.description_id) ? service.description_id : service.description;

                    const displayFeatures = (isId && Array.isArray((service as Service).features_id) && ((service as Service).features_id as string[]).length > 0)
                        ? (service as Service).features_id as string[]
                        : (service.features as string[]) || [];

                    const intervalLabel = service.interval === 'one_time'
                        ? (isId ? 'Sekali Bayar' : 'One Time')
                        : (isId ? `Per ${service.interval}` : `Per ${service.interval}`);

                    return (
                        <BentoServiceCard
                            key={service.id}
                            service={service}
                            title={title}
                            desc={desc}
                            displayFeatures={displayFeatures}
                            intervalLabel={intervalLabel}
                            variants={itemVariants}
                            isId={isId}
                            ctaLabel={t("ctaGeneric")}
                        />
                    );
                })}
            </motion.div>

            {/* Load More Button */}
            {initialServices.length > visibleCount && (
                <Button
                    variant="outline"
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900"
                >
                    Load More <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    );
}

interface BentoServiceCardProps {
    service: Service;
    title: string | null;
    desc: string | null;
    displayFeatures: string[];
    intervalLabel: string;
    variants: Variants;
    isId: boolean;
    ctaLabel: string;
}

function BentoServiceCard({ service, title, desc, displayFeatures, intervalLabel, variants, isId, ctaLabel }: BentoServiceCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            variants={variants}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col"
        >
            {/* Interactive Glow Effect */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(254, 215, 0, 0.15), transparent 40%)`,
                }}
            />

            <div className="flex flex-col h-full">
                {/* Visual Block */}
                <div className="relative overflow-hidden shrink-0 aspect-[16/9]">
                    {service.image ? (
                        <Image
                            src={service.image}
                            alt={title || "Service"}
                            fill
                            unoptimized={true}
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>

                <div className="flex flex-col flex-grow p-6 md:p-8 relative z-10">
                    {/* Header Block */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                                {intervalLabel}
                            </div>
                        </div>
                        <h3 className="font-black text-white group-hover:text-brand-yellow transition-colors leading-tight mb-3 text-xl md:text-2xl">
                            {title}
                        </h3>
                        <div
                            className="text-zinc-400 text-sm leading-relaxed line-clamp-2 font-light"
                            dangerouslySetInnerHTML={{ __html: desc || "" }}
                        />
                    </div>

                    <Dialog>
                        {/* Bento Sub-grid for Features & Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                            {/* Features Block */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col relative group/list">
                                <ul className="space-y-2">
                                    {displayFeatures.slice(0, 3).map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 group/item">
                                            <Check className="w-3 h-3 text-brand-yellow shrink-0 mt-0.5" />
                                            <span className="text-[11px] text-zinc-400 group-hover/item:text-white transition-colors line-clamp-1">{feature.replace(/<[^>]*>?/gm, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                                {displayFeatures.length > 3 && (
                                    <>
                                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
                                        <DialogTrigger asChild>
                                            <button className="text-[9px] text-brand-yellow font-bold uppercase tracking-widest mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity">
                                                +{displayFeatures.length - 3} More <ChevronDown className="w-2.5 h-2.5" />
                                            </button>
                                        </DialogTrigger>
                                    </>
                                )}
                            </div>

                            {/* Metrics Block */}
                            <div className="p-4 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/10 flex flex-col justify-between">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Fixed Price</div>
                                <div className="text-2xl font-black text-white tracking-tighter">
                                    <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} />
                                </div>
                                <PurchaseButton
                                    serviceId={service.id}
                                    interval={service.interval}
                                    customLabel={ctaLabel}
                                    className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-9 px-4 rounded-xl w-full text-[10px] uppercase mt-4 tracking-tighter shadow-lg shadow-brand-yellow/20"
                                />
                            </div>
                        </div>
                        <ServiceModalContent service={service} isId={isId} />
                    </Dialog>
                </div>
            </div>
        </motion.div>
    );
}
