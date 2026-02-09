"use client";

import { motion } from "framer-motion";
import { Star, Award, Code2, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Expert {
    id: string;
    name: string;
    role: string;
    specialty: string;
    exp: string;
    image: string;
}

export default function ExpertsPage() {
    const t = useTranslations("Experts");
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const response = await fetch("/api/experts");
                const data = await response.json();
                if (Array.isArray(data)) {
                    setExperts(data);
                }
            } catch (error) {
                console.error("Failed to fetch experts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExperts();
    }, []);


    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold mb-6"
                    >
                        <Award className="w-3 h-3" /> {t("badge")}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        {t.rich("title", {
                            blue: (chunks) => <span className="text-blue-500">{chunks}</span>
                        })}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg leading-relaxed"
                    >
                        {t("description")}
                    </motion.p>
                </div>

                {/* Expert Cards */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-zinc-500">Scanning for elite operatives...</p>
                    </div>
                ) : experts.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 rounded-3xl bg-zinc-900/20">
                        <p className="text-zinc-500">No experts are currently available for deployment.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
                        {experts.map((expert, i) => (
                            <motion.div
                                key={expert.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                    <Avatar className="w-24 h-24 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors">
                                        <AvatarImage src={expert.image} alt={expert.name} />
                                        <AvatarFallback>{expert.name[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{expert.name}</h3>
                                <div className="text-blue-500 font-medium text-sm mb-4">{expert.role}</div>
                                <div className="w-full pt-4 border-t border-white/5 space-y-2">
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Specialty</div>
                                    <div className="text-sm font-medium text-zinc-300">{expert.specialty}</div>
                                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold mt-2">
                                        {expert.exp} Experience
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}


                {/* Vetting Process */}
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{t("Vetting.title")}</h2>
                        <p className="text-zinc-500">{t("Vetting.subtitle")}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <Code2 className="w-8 h-8 text-blue-500" />
                            <h4 className="font-bold text-lg">{t("Vetting.Technical.title")}</h4>
                            <p className="text-zinc-400 text-sm">{t("Vetting.Technical.desc")}</p>
                        </div>
                        <div className="space-y-4">
                            <Star className="w-8 h-8 text-blue-500" />
                            <h4 className="font-bold text-lg">{t("Vetting.Industrial.title")}</h4>
                            <p className="text-zinc-400 text-sm">{t("Vetting.Industrial.desc")}</p>
                        </div>
                        <div className="space-y-4">
                            <Globe className="w-8 h-8 text-blue-500" />
                            <h4 className="font-bold text-lg">{t("Vetting.Strategic.title")}</h4>
                            <p className="text-zinc-400 text-sm">{t("Vetting.Strategic.desc")}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <Link href="/contact" className="inline-flex items-center gap-2 text-blue-500 font-bold hover:text-white transition-colors group">
                        {t("cta")} <Star className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
