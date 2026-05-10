"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslations, useMessages } from "next-intl";
import { motion } from "framer-motion";

export function FAQSection() {
    const messages = useMessages();
    const faqData = (messages as Record<string, unknown>)?.FAQ || {};
    const t = useTranslations("FAQ");
    
    const questionKeys = Object.keys(faqData)
        .filter(key => key.startsWith('q'))
        .sort((a, b) => {
            const numA = parseInt(a.substring(1));
            const numB = parseInt(b.substring(1));
            return numA - numB;
        });

    if (questionKeys.length === 0) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 bg-brand-yellow relative overflow-hidden">
            {/* Pola background mesh/crosshatch yang stabil */}
            <div className="absolute inset-0 z-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(45deg, #000 0.5px, transparent 0.5px), linear-gradient(-45deg, #000 0.5px, transparent 0.5px)`,
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-black mb-4 tracking-tighter italic uppercase leading-none">
                        {t("title")}
                    </h2>
                    <div className="w-24 h-2 bg-black mx-auto mt-4" />
                </motion.div>

                <Accordion type="single" collapsible className="w-full text-black space-y-2">
                    {questionKeys.map((key, index) => {
                        const i = key.substring(1);
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <AccordionItem 
                                    value={`item-${i}`} 
                                    className="border-none bg-black/5 hover:bg-black/10 transition-colors rounded-xl px-6"
                                >
                                    <AccordionTrigger className="hover:no-underline text-left font-black tracking-tight text-lg md:text-xl py-6 [&>svg]:text-black [&>svg]:w-6 [&>svg]:h-6 [&>svg]:opacity-100 [&>svg]:stroke-[3]">
                                        {t(key)}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-black/80 font-medium leading-relaxed text-base md:text-lg pb-8 max-w-3xl border-t border-black/5 pt-4">
                                        {t.rich(`a${i}`, {
                                            strong: (chunks) => <strong className="text-black font-black underline decoration-black/20 decoration-4 underline-offset-4">{chunks}</strong>
                                        })}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        );
                    })}
                </Accordion>

                {/* FAQ Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": questionKeys.map((key) => {
                                const i = key.substring(1);
                                return {
                                    "@type": "Question",
                                    "name": t(key),
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": (t.raw("a" + i) as string).replace(/<\/?[^>]+(>|$)/g, "")
                                    }
                                };
                            })
                        })
                    }}
                />
            </div>
        </section>
    )
}
