import { MessageSquare, Calculator, MousePointerClick } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Workflow() {
    const t = await getTranslations("Workflow");

    return (
        <section className="py-24 bg-zinc-950 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400">{t("subtitle")}</p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-yellow/20 via-brand-yellow/50 to-brand-yellow/20" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-brand-yellow/50 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(254,215,0,0.3)]">
                                <MessageSquare className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step1")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step1Desc")}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-brand-yellow rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_30px_rgba(254,215,0,0.5)]">
                                <Calculator className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step2")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step2Desc")}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-brand-yellow/50 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(254,215,0,0.3)]">
                                <MousePointerClick className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step3")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step3Desc")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
