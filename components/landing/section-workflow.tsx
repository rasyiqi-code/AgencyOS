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
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-blue-500 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <MessageSquare className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step1")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step1Desc")}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-indigo-500 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                <Calculator className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t("step2")}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {t("step2Desc")}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-purple-500 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
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
