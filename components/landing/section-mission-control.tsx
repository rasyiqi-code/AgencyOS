import { Terminal, CalendarCheck, MessageSquare, Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SectionMissionControl() {
    const t = await getTranslations("ClientDashboard.MissionControl");

    return (
        <section className="py-24 bg-black relative overflow-hidden border-t border-white/5">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            />

            <div className="absolute top-1/3 left-0 w-96 h-96 bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-yellow text-xs font-bold tracking-widest mb-6">
                        <Activity className="w-3.5 h-3.5" />
                        {t("badge")}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight italic">
                        {t("title")} <br className="hidden md:block" />
                        <span className="text-white/50">{t("titleHighlight")}</span>
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
                        {t("description")}
                    </p>
                </div>

                {/* Clean Feature Text */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                                <Terminal className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight">{t("f1Title")}</h3>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{t("f1Desc")}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                                <CalendarCheck className="w-5 h-5 text-brand-yellow" />
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight">{t("f2Title")}</h3>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{t("f2Desc")}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight">{t("f3Title")}</h3>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{t("f3Desc")}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
