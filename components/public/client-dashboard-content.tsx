"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    MessageSquare,
    FileText,
    AlertCircle,
    Terminal,
    History,
    CheckCircle2,
    Lock
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function ClientDashboardContent() {
    const t = useTranslations("ClientDashboard");

    const platformFeatures = [
        {
            icon: <History className="w-6 h-6" />,
            title: t("Features.dailyUpdates.title"),
            desc: t("Features.dailyUpdates.desc")
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: t("Features.comms.title"),
            desc: t("Features.comms.desc")
        },
        {
            icon: <AlertCircle className="w-6 h-6" />,
            title: t("Features.issues.title"),
            desc: t("Features.issues.desc")
        },
        {
            icon: <Terminal className="w-6 h-6" />,
            title: t("Features.specs.title"),
            desc: t("Features.specs.desc")
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: t("Features.docs.title"),
            desc: t("Features.docs.desc")
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: t("Features.status.title"),
            desc: t("Features.status.desc")
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-bold mb-6"
                    >
                        <ShieldCheck className="w-3 h-3" /> {t("badge")}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6 whitespace-pre-line"
                    >
                        {t.rich("title", {
                            yellow: (chunks) => <span className="text-brand-yellow">{chunks}</span>
                        })}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        {t("description")}
                    </motion.p>
                </div>

                {/* Platform Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                    {platformFeatures.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-brand-yellow/30 transition-all group flex flex-col h-full"
                        >
                            <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* No Meeting Philosophy Section */}
                <div className="max-w-6xl mx-auto mb-20 bg-zinc-900/30 border border-white/5 rounded-[32px] p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold mb-6">
                                <AlertCircle className="w-3 h-3" /> {t("Philosophy.badge")}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                {t.rich("Philosophy.title", {
                                    red: (chunks) => <span className="text-red-500">{chunks}</span>
                                })}
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                {t("Philosophy.desc")}
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-bold text-white mb-2">65%</div>
                                    <div className="text-sm text-zinc-400 leading-snug">{t("Philosophy.stat1")}</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-bold text-white mb-2">71%</div>
                                    <div className="text-sm text-zinc-400 leading-snug">{t("Philosophy.stat2")}</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-bold text-white mb-2">25m</div>
                                    <div className="text-sm text-zinc-400 leading-snug">{t("Philosophy.stat3")}</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-bold text-white mb-2">73%</div>
                                    <div className="text-sm text-zinc-400 leading-snug">{t("Philosophy.stat4")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm h-full flex flex-col justify-center">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <CheckCircle2 className="text-brand-yellow w-5 h-5" /> {t("Philosophy.wayTitle")}
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-zinc-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full mt-2 shrink-0" />
                                    <span dangerouslySetInnerHTML={{ __html: t.raw("Philosophy.way1") }} />
                                </li>
                                <li className="flex gap-3 text-zinc-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full mt-2 shrink-0" />
                                    <span dangerouslySetInnerHTML={{ __html: t.raw("Philosophy.way2") }} />
                                </li>
                                <li className="flex gap-3 text-zinc-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full mt-2 shrink-0" />
                                    <span dangerouslySetInnerHTML={{ __html: t.raw("Philosophy.way3") }} />
                                </li>
                                <li className="flex gap-3 text-zinc-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full mt-2 shrink-0" />
                                    <span dangerouslySetInnerHTML={{ __html: t.raw("Philosophy.way4") }} />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Call to Action Block */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto p-12 rounded-[40px] bg-gradient-to-b from-zinc-900 to-black border border-white/10 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-yellow/5 blur-[100px] pointer-events-none" />

                    <Lock className="w-12 h-12 text-brand-yellow mx-auto mb-8" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("Cta.title")}</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto mb-10 text-lg">
                        {t("Cta.desc")}
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href="/dashboard" className="px-10 py-4 rounded-full bg-brand-yellow text-black font-extrabold hover:bg-white transition-all transform hover:scale-105">
                            {t("Cta.button")}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
