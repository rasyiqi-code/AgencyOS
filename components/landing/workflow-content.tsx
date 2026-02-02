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

    return (
        <div className="container mx-auto px-4">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="space-y-16"
            >
                <motion.div variants={itemVariants} className="text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400">{t("subtitle")}</p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-yellow/20 via-brand-yellow/50 to-brand-yellow/20 origin-left"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <motion.div variants={itemVariants} className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-brand-yellow/50 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(254,215,0,0.3)] group hover:border-brand-yellow transition-all duration-500">
                                <MessageSquare className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step1")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step1Desc")}
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div variants={itemVariants} className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-brand-yellow rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_30px_rgba(254,215,0,0.5)] group hover:scale-110 transition-all duration-500">
                                <Calculator className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step2")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step2Desc")}
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div variants={itemVariants} className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-brand-yellow/50 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(254,215,0,0.3)] group hover:border-brand-yellow transition-all duration-500">
                                <MousePointerClick className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step3")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step3Desc")}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
