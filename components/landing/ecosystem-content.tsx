"use client";

import { motion, Variants } from "framer-motion";
import { LayoutDashboard, Users, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface EcosystemContentProps {
    agencyName: string;
}

export function EcosystemContent({ agencyName }: EcosystemContentProps) {
    const t = useTranslations("Ecosystem");
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
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
        <div className="container mx-auto px-4 relative z-10">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="space-y-16"
            >
                <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        {t("title", { brand: agencyName })}
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        {t("subtitle")}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Client Portal */}
                    <motion.div variants={itemVariants}>
                        <Link href="/dashboard" className="group block h-full">
                            <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-brand-yellow/50 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <LayoutDashboard className="w-24 h-24 text-brand-yellow rotate-12" />
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mb-6 group-hover:scale-110 transition-transform">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-yellow transition-colors">{t("clientTitle")}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    {t("clientDesc")}
                                </p>

                                <div className="flex items-center text-brand-yellow text-sm font-bold mt-auto">
                                    {t("clientCta")} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Squad Portal (Activated) */}
                    <motion.div variants={itemVariants}>
                        <Link href="/squad" className="group block h-full">
                            <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users className="w-24 h-24 text-blue-500 rotate-12" />
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-500 transition-colors">{t("squadTitle")}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    {t("squadDesc")}
                                </p>

                                <div className="flex items-center text-blue-500 text-sm font-bold mt-auto">
                                    {t("squadCta")} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Admin Core */}
                    <motion.div variants={itemVariants}>
                        <div className="group block h-full select-none cursor-default opacity-80 hover:opacity-100 transition-opacity">
                            <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/50 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ShieldCheck className="w-24 h-24 text-white rotate-12" />
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">{t("adminTitle")}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    {t("adminDesc")}
                                </p>

                                <div className="flex items-center text-white/50 text-sm font-bold mt-auto">
                                    {t("adminCta")} <ShieldCheck className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
