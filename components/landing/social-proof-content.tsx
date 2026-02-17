"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Database, Cloud, Zap, Lock, Brain, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";

export function SocialProofContent() {
    const t = useTranslations("SocialProof");
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ["start end", "end start"]
    });

    // Smooth horizontal scroll effect linked to vertical scroll
    const x = useTransform(scrollYProgress, [0, 1], ["5%", "-10%"]);

    return (
        <motion.div
            ref={scrollRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="container mx-auto px-4 overflow-hidden"
        >
            <motion.div
                style={{ x }}
                className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 py-8 items-center text-center snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:transform-none"
            >
                <motion.div variants={itemVariants} className="space-y-2 min-w-[85vw] sm:min-w-[350px] md:min-w-0 flex-shrink-0 snap-center">
                    <div className="flex items-center justify-center gap-2 text-brand-yellow font-bold text-3xl">
                        <Zap className="w-6 h-6" />
                        <span>{t("faster")}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{t("fasterSub")}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2 md:border-x border-white/5 min-w-[85vw] sm:min-w-[350px] md:min-w-0 flex-shrink-0 snap-center">
                    <div className="flex items-center justify-center gap-2 text-white font-bold text-3xl">
                        <span>{t("fixedPrice")}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{t("fixedPriceSub")}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2 min-w-[85vw] sm:min-w-[350px] md:min-w-0 flex-shrink-0 snap-center">
                    <div className="flex items-center justify-center gap-2 text-brand-grey font-bold text-3xl">
                        <Lock className="w-6 h-6" />
                        <span>{t("verified")}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{t("verifiedSub")}</p>
                </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 text-center space-y-4">
                <div className="relative overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                    <motion.div
                        className="flex gap-12 md:gap-16 w-max pr-12 md:pr-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                        animate={{ x: "-50%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30,
                        }}
                    >
                        {[...Array(4)].flatMap(() => [
                            { icon: LayoutTemplate, text: t("stackFramework") },
                            { icon: Cloud, text: t("stackCloud") },
                            { icon: Database, text: t("stackDatabase") },
                            { icon: Brain, text: t("stackAI") }
                        ]).map((item, i) => (
                            <div key={i} className="flex items-center justify-center gap-2 text-zinc-300 font-bold whitespace-nowrap">
                                <item.icon className="w-5 h-5" /> {item.text}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
