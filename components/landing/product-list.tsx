"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { useTranslations, useLocale } from "next-intl";
import { type Service } from "@/components/public/service-detail-content";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from "react";

interface ProductListProps {
    initialServices: Service[];
}

export function ProductList({ initialServices }: ProductListProps) {
    const t = useTranslations("ProductCatalog");
    const locale = useLocale();
    const isId = locale === 'id';

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: false,
        dragFree: true,
        containScroll: 'trimSnaps'
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        // Defer initial state sync to avoid cascading renders lint warning
        Promise.resolve().then(onSelect);

        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

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
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="relative w-full group/carousel">
            {/* Navigation Buttons */}
            <div className="flex justify-end gap-2 mb-6 px-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    disabled={!prevBtnEnabled}
                    className="rounded-full border-white/10 bg-zinc-900/50 backdrop-blur-sm text-white hover:bg-brand-yellow hover:text-black disabled:opacity-30 disabled:hover:bg-zinc-900/50 disabled:hover:text-white transition-all shadow-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    disabled={!nextBtnEnabled}
                    className="rounded-full border-white/10 bg-zinc-900/50 backdrop-blur-sm text-white hover:bg-brand-yellow hover:text-black disabled:opacity-30 disabled:hover:bg-zinc-900/50 disabled:hover:text-white transition-all shadow-xl"
                >
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                    className="flex gap-4 md:gap-6 px-2 md:px-4"
                >
                    {initialServices.map((service) => {
                        const title = (isId && service.title_id) ? service.title_id : service.title;

                        const displayFeatures = (isId && Array.isArray((service as Service).features_id) && ((service as Service).features_id as string[]).length > 0)
                            ? (service as Service).features_id as string[]
                            : (service.features as string[]) || [];

                        const intervalLabel = service.interval === 'one_time'
                            ? (isId ? 'Sekali Bayar' : 'One Time')
                            : (isId ? `Per ${service.interval}` : `Per ${service.interval}`);

                        return (
                            <div key={service.id} className="flex-[0_0_92%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
                                <BentoServiceCard
                                    service={service}
                                    title={title}
                                    displayFeatures={displayFeatures}
                                    intervalLabel={intervalLabel}
                                    variants={itemVariants}
                                    ctaLabel={t("ctaGeneric")}
                                />
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

interface BentoServiceCardProps {
    service: Service;
    title: string | null;
    displayFeatures: string[];
    intervalLabel: string;
    variants: Variants;
    ctaLabel: string;
}

function BentoServiceCard({ service, title, displayFeatures, intervalLabel, variants, ctaLabel }: BentoServiceCardProps) {
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
            className="group relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col h-full"
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
                <Link href={`/services/${service.slug}`} className="relative overflow-hidden shrink-0 aspect-square block">
                    {service.image ? (
                        <Image
                            src={service.image}
                            alt={title || "Service"}
                            fill
                            unoptimized={true}
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-zinc-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </Link>

                <div className="flex flex-col flex-grow p-4 md:p-8 relative z-10">
                    {/* Header Block */}
                    <div className="mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] md:text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                                {intervalLabel}
                            </div>
                        </div>
                        <Link href={`/services/${service.slug}`}>
                            <h3 className="font-black text-white group-hover:text-brand-yellow transition-colors leading-tight mb-2 md:mb-3 text-lg md:text-2xl">
                                {title}
                            </h3>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-auto">
                        {/* Features Block */}
                        <div className="p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col relative group/list">
                            <ul className="space-y-1.5 md:space-y-2">
                                {displayFeatures.slice(0, 3).map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 group/item">
                                        <Check className="w-3 h-3 text-brand-yellow shrink-0 mt-0.5" />
                                        <span className="text-[10px] md:text-[11px] text-zinc-400 group-hover/item:text-white transition-colors line-clamp-1">{feature.replace(/<[^>]*>?/gm, '')}</span>
                                    </li>
                                ))}
                            </ul>
                            {displayFeatures.length > 3 && (
                                <>
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
                                    <Link
                                        href={`/services/${service.slug}`}
                                        className="text-[8px] md:text-[9px] text-brand-yellow font-bold uppercase tracking-widest mt-1.5 md:mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                        +{displayFeatures.length - 3} More <ChevronDown className="w-2.5 h-2.5" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Metrics Block */}
                        <div className="p-3 md:p-4 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/10 flex flex-col justify-between">
                            <div className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5 md:mb-1">Total Fixed Price</div>
                            <div className="text-xl md:text-2xl font-black text-white tracking-tighter">
                                <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                            </div>
                            <PurchaseButton
                                serviceId={service.id}
                                interval={service.interval}
                                customLabel={ctaLabel}
                                className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-8 md:h-9 px-3 md:px-4 rounded-xl w-full text-[9px] md:text-[10px] uppercase mt-3 md:mt-4 tracking-tighter shadow-lg shadow-brand-yellow/20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
