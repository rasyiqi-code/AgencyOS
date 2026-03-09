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
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter uppercase italic">
                        {t("title")}
                    </h2>
                    <p className="text-black font-bold max-w-2xl mx-auto opacity-80">{t("subtitle")}</p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line (Desktop) - Pure Black */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-black/20 origin-left"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <motion.div variants={itemVariants} className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-black/10 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-2xl group hover:scale-105 transition-all duration-500">
                                <MessageSquare className="w-10 h-10 text-brand-yellow group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-xl font-black text-black mb-3 italic uppercase tracking-tight">{t("step1")}</h3>
                            <p className="text-black text-sm font-bold leading-relaxed opacity-80">
                                {t("step1Desc")}
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div variants={itemVariants} className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-black/10 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-2xl group hover:scale-110 transition-all duration-500">
                                <Calculator className="w-10 h-10 text-brand-yellow" />
                            </div>
                            <h3 className="text-xl font-black text-black mb-3 italic uppercase tracking-tight">{t("step2")}</h3>
                            <p className="text-black text-sm font-bold leading-relaxed opacity-80">
                                {t("step2Desc")}
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div variants={itemVariants} className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-black/10 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-2xl group hover:scale-105 transition-all duration-500">
                                <MousePointerClick className="w-10 h-10 text-brand-yellow group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-xl font-black text-black mb-3 italic uppercase tracking-tight">{t("step3")}</h3>
                            <p className="text-black text-sm font-bold leading-relaxed opacity-80">
                                {t("step3Desc")}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
