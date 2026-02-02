"use client";

import { motion, Variants } from "framer-motion";
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

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="container mx-auto px-4"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 items-center text-center">
                <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-brand-yellow font-bold text-3xl">
                        <Zap className="w-6 h-6" />
                        <span>{t("faster")}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{t("fasterSub")}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2 border-x border-white/5">
                    <div className="flex items-center justify-center gap-2 text-white font-bold text-3xl">
                        <span>{t("fixedPrice")}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{t("fixedPriceSub")}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-brand-grey font-bold text-3xl">
                        <Lock className="w-6 h-6" />
                        <span>{t("verified")}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{t("verifiedSub")}</p>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mt-12 text-center space-y-4">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{t("techStack")}</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 text-zinc-300 font-bold">
                        <LayoutTemplate className="w-5 h-5" /> {t("stackFramework")}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300 font-bold">
                        <Cloud className="w-5 h-5" /> {t("stackCloud")}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300 font-bold">
                        <Database className="w-5 h-5" /> {t("stackDatabase")}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300 font-bold">
                        <Brain className="w-5 h-5" /> {t("stackAI")}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
