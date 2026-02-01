import { LayoutDashboard, Users, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export async function SectionEcosystem() {
    const t = await getTranslations("Ecosystem");

    // Fetch Agency Name
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        {t("title", { brand: agencyName })}
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Client Portal */}
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

                    {/* Squad Portal */}
                    <div className="group block h-full opacity-70 cursor-not-allowed">
                        <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Users className="w-24 h-24 text-brand-grey rotate-12" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-brand-grey">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <Badge variant="outline" className="border-white/20 text-white/50 bg-white/5 px-3 py-1 text-[10px] tracking-widest uppercase">
                                    Coming Soon
                                </Badge>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{t("squadTitle")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                {t("squadDesc")}
                            </p>

                            <div className="flex items-center text-brand-grey/50 text-sm font-bold mt-auto">
                                {t("squadCta")} <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </div>

                    {/* Admin Core */}
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
                </div>
            </div>
        </section>
    );
}
