"use client";

import { motion, Variants } from "framer-motion";
import { Database, Cloud, Zap, Lock, Brain, LayoutTemplate, ShieldCheck } from "lucide-react";
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
            className="container mx-auto px-4 overflow-hidden py-8"
        >
            <motion.div variants={itemVariants} className="text-center space-y-4">
                <div className="relative overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                    <motion.div
                        className="flex gap-12 md:gap-16 w-max pr-12 md:pr-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                        animate={{ x: "-50%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 40,
                        }}
                    >
                        {[...Array(4)].flatMap(() => [
                            { icon: Zap, text: t("faster") },
                            { icon: ShieldCheck, text: t("fixedPrice") },
                            { icon: Lock, text: t("verified") },
                            { icon: LayoutTemplate, text: t("stackFramework") },
                            { icon: Cloud, text: t("stackCloud") },
                            { icon: Database, text: t("stackDatabase") },
                            { icon: Brain, text: t("stackAI") }
                        ]).map((item, i) => (
                            <div key={i} className="flex items-center justify-center gap-2 text-zinc-300 font-bold whitespace-nowrap text-sm sm:text-base md:text-lg">
                                <item.icon className="w-5 h-5 text-brand-yellow" /> {item.text}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
