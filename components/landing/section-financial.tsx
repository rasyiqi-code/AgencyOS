import { Check, X, Info, Building2, Rocket } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getSystemSettings } from "@/lib/server/settings";

export async function FinancialLogic() {
    const t = await getTranslations("Financial");
    // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <section className="py-24 bg-brand-yellow relative overflow-hidden">
            {/* Pola background dots yang premium (Dot Matrix) */}
            <div className="absolute inset-0 z-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Elemen dekoratif blur (gelap untuk kedalaman) */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-black/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-black/5 blur-[120px] rounded-full" />


            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 relative group/tooltip">
                    <h2 className="text-2xl md:text-4xl font-black text-black mb-4 tracking-tight inline-flex items-center gap-3 italic">
                        {t("title")}
                        <div className="relative cursor-help">
                            <Info className="w-5 h-5 text-black/20 hover:text-black transition-colors" />
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-y-2 -translate-x-1/2 mb-3 w-64 p-3 bg-black border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50">
                                <p className="text-[10px] text-zinc-400 font-bold tracking-wide leading-relaxed">
                                    {t("comparison")} Analysis Based on Standard Market Rates 2025
                                </p>
                                {/* Tooltip Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
                            </div>
                        </div>
                    </h2>
                    <p className="text-black/70 font-semibold text-base max-w-xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 scrollbar-hide lg:grid lg:grid-cols-2 lg:gap-6 lg:items-stretch lg:max-w-4xl lg:mx-auto lg:overflow-visible lg:pb-0 px-6 md:px-0">
                    {/* Card A: Typical Full-time Hire */}
                    <div className="relative group flex-shrink-0 w-[78vw] md:w-[400px] lg:w-full snap-center">
                        {/* Side Tab "01" */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-16 bg-zinc-100 border border-black/5 rounded-l-lg items-center justify-center shadow-2xl z-20">
                            <span className="text-sm font-black text-black/40 rotate-180 [writing-mode:vertical-lr]">01</span>
                        </div>

                        <div className="h-full bg-white border border-black/15 rounded-[2rem] p-5 md:p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.01] shadow-2xl">

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-black/5 flex-shrink-0">
                                        <Building2 className="w-5 h-5 text-black/60" />
                                    </div>
                                    <h3 className="text-lg font-black text-black tracking-tighter leading-tight italic">{t("hireSenior")}</h3>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                        <div className="text-xl font-black text-red-600 mb-0.5 tracking-tighter">{t("salaryOldValue")}</div>
                                        <div className="text-[10px] text-black/50 font-black tracking-wide leading-none">{t("salaryOld")}</div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3 group/item">
                                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-500/20 transition-colors">
                                                <X className="w-3 h-3 text-red-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-black/80 text-sm font-bold tracking-tight">{t("hiringTimeOld")}</span>
                                        </div>
                                        <div className="flex items-center gap-3 group/item">
                                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-500/20 transition-colors">
                                                <X className="w-3 h-3 text-red-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-black/80 text-sm font-bold tracking-tight">{t("riskOld")}</span>
                                        </div>
                                        <div className="flex items-center gap-3 group/item">
                                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-500/20 transition-colors">
                                                <X className="w-3 h-3 text-red-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-black/80 text-sm font-bold tracking-tight">{t("managementOld")}</span>
                                        </div>
                                        <div className="flex items-center gap-3 group/item">
                                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-500/20 transition-colors">
                                                <Info className="w-3 h-3 text-red-500/50" />
                                            </div>
                                            <span className="text-black/80 text-[11px] font-black tracking-wide leading-tight">{t("hiddenCostOld")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card B: Agency (Strategic Partner) */}
                    <div className="relative group flex-shrink-0 w-[78vw] md:w-[400px] lg:w-full snap-center">
                        {/* Side Tab "02" */}
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-16 bg-black border border-white/5 rounded-r-lg items-center justify-center shadow-2xl z-20">
                            <span className="text-sm font-black text-brand-yellow [writing-mode:vertical-lr]">02</span>
                        </div>

                        <div className="h-full bg-black border border-white/20 rounded-[2rem] p-5 md:p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-2xl ring-1 ring-white/10">

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-end gap-4">
                                    <h3 className="text-lg font-black text-white tracking-tighter leading-tight italic text-right">{t("hybrid", { brand: agencyName })}</h3>
                                    <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20 shadow-inner flex-shrink-0">
                                        <Rocket className="w-5 h-5 text-brand-yellow animate-pulse" />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <div className="p-4 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 shadow-lg shadow-brand-yellow/5">
                                        <div className="text-xl font-black text-brand-yellow mb-0.5 tracking-tighter">{t("salaryNewValue")}</div>
                                        <div className="text-[10px] text-brand-yellow/60 font-black tracking-wide leading-none">{t("salaryNew")}</div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3 justify-end group/item text-right">
                                            <span className="text-zinc-300 text-sm font-black tracking-tight">{t("hiringTimeNew")}</span>
                                            <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-yellow/20">
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 justify-end group/item text-right">
                                            <span className="text-zinc-300 text-sm font-black tracking-tight">{t("hiddenCostNew")}</span>
                                            <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-yellow/20">
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 justify-end group/item text-right">
                                            <span className="text-emerald-400 text-sm font-black tracking-tight">{t("riskNew")}</span>
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 text-right group/item">
                                            <div className="flex items-center gap-3">
                                                <span className="text-brand-yellow font-black tracking-wide text-[11px]">{t("ownership")}</span>
                                                <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-yellow/20">
                                                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
