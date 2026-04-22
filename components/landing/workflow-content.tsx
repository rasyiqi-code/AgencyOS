"use client";

import { motion, Variants } from "framer-motion";
import { MessageSquare, Calculator, MousePointerClick } from "lucide-react";
import { useTranslations } from "next-intl";

export function WorkflowContent() {
    const t = useTranslations("Workflow");
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
        }
    };

    const steps = [
        {
            key: "step1",
            icon: MessageSquare,
        },
        {
            key: "step2",
            icon: Calculator,
        },
        {
            key: "step3",
            icon: MousePointerClick,
        }
    ];

    return (
        <div className="container mx-auto px-4">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="space-y-12 md:space-y-16"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center flex flex-col items-center">
                    <div className="px-3 py-1 rounded-full bg-black/10 border border-black/5 text-black text-[9px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm backdrop-blur-md">
                        {t("badge")}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter uppercase italic leading-tight">
                        {t("title")}
                    </h2>
                    <p className="text-black/70 font-bold max-w-2xl mx-auto text-base md:text-lg">{t("subtitle")}</p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line (Desktop) - Horizontal */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="hidden md:block absolute top-9 left-[10%] right-[10%] h-0.5 bg-black/20 origin-left"
                    />

                    {/* Connecting Line (Mobile) - Vertical Left-Aligned */}
                    <motion.div
                        initial={{ scaleY: 0, opacity: 0 }}
                        whileInView={{ scaleY: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="md:hidden absolute left-8 top-8 bottom-12 w-0.5 bg-black/20 origin-top"
                    />

                    <div className="flex flex-col md:grid md:grid-cols-3 gap-10 md:gap-12">
                        {steps.map((step) => (
                            <motion.div 
                                key={step.key}
                                variants={itemVariants} 
                                className="relative flex md:flex-col items-center md:items-center gap-6 md:gap-0"
                            >
                                {/* Circle & Icon */}
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-black border-4 border-black/10 rounded-full flex items-center justify-center relative z-10 md:mx-auto md:mb-4 shadow-2xl group hover:scale-105 transition-all duration-500 shrink-0">
                                    <step.icon className="w-7 h-7 md:w-9 md:h-9 text-brand-yellow group-hover:scale-110 transition-transform" />
                                </div>

                                {/* Text Content */}
                                <div className="flex flex-col text-left md:text-center">
                                    <h3 className="text-lg md:text-xl font-black text-black mb-1 md:mb-2 italic uppercase tracking-tight leading-none">
                                        {t(step.key)}
                                    </h3>
                                    <p className="text-black/80 text-sm font-bold leading-relaxed max-w-[280px] md:mx-auto">
                                        {t(`${step.key}Desc`)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
