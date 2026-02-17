import { Check, X, Info } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/config/db";

export async function FinancialLogic() {
    const t = await getTranslations("Financial");
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <section className="py-24 bg-zinc-950 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400">{t("subtitle")}</p>
                </div>

                <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-3 bg-white/5 border-b border-white/10 text-sm font-bold text-white p-4">
                                <div className="text-zinc-500 uppercase">{t("comparison")}</div>
                                <div className="text-center text-zinc-400 uppercase">{t("hireSenior")}</div>
                                <div className="text-center text-brand-yellow uppercase">{t("hybrid", { brand: agencyName })}</div>
                            </div>

                            {/* Row 1: Cost */}
                            <div className="grid grid-cols-3 p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                                <div className="font-medium text-zinc-300">{t("salary")}</div>
                                <div className="text-center text-red-400">
                                    <div className="font-bold text-lg">Rp 180 Jt+</div>
                                    <div className="text-xs text-zinc-500">{t("salaryOld")}</div>
                                </div>
                                <div className="text-center text-emerald-400">
                                    <div className="font-bold text-lg">Rp 15 - 30 Jt</div>
                                    <div className="text-xs text-emerald-500/70">{t("salaryNew")}</div>
                                </div>
                            </div>

                            {/* Row 2: Time */}
                            <div className="grid grid-cols-3 p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                                <div className="font-medium text-zinc-300">{t("hiringTime")}</div>
                                <div className="text-center text-zinc-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <X className="w-4 h-4 text-red-500" />
                                        1 - 2 Bulan
                                    </div>
                                </div>
                                <div className="text-center text-white">
                                    <div className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4 text-brand-yellow" />
                                        {t("hiringTimeNew")}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Hidden Cost */}
                            <div className="grid grid-cols-3 p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                                <div className="font-medium text-zinc-300 flex items-center gap-1">
                                    {t("hiddenCost")} <Info className="w-3 h-3 text-zinc-600" />
                                </div>
                                <div className="text-center text-zinc-400">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-red-400 text-sm">{t("hiddenCostOld")}</span>
                                    </div>
                                </div>
                                <div className="text-center text-white">
                                    <div className="font-bold text-emerald-400">Rp 0</div>
                                </div>
                            </div>

                            {/* Row 4: Risk */}
                            <div className="grid grid-cols-3 p-6 items-center hover:bg-white/5 transition-colors bg-brand-yellow/5">
                                <div className="font-medium text-zinc-300">{t("risk")}</div>
                                <div className="text-center text-zinc-400">
                                    <div className="text-sm text-red-400">{t("riskOld")}</div>
                                </div>
                                <div className="text-center text-white">
                                    <div className="text-sm text-brand-yellow font-medium">{t("riskNew")}</div>
                                    <div className="text-[10px] text-zinc-500 mt-1">{t("roi")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
