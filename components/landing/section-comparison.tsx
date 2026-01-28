import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Comparison() {
    const t = await getTranslations("Comparison");

    return (
        <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400">{t("subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Traditional */}
                    <div className="p-8 rounded-2xl border border-white/5 bg-white/5 grayscale opacity-70">
                        <h3 className="text-xl font-bold text-zinc-400 mb-8 border-b border-white/10 pb-4">{t("oldTitle")}</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start text-zinc-400">
                                <X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                                <span>{t("old1")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-zinc-400">
                                <X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                                <span>{t("old2")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-zinc-400">
                                <X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                                <span>{t("old3")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-zinc-400">
                                <X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                                <span>{t("old4")}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Crediblemark */}
                    <div className="p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600 text-xs font-bold text-white rounded-bl-xl">
                            {t("recommended")}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-8 border-b border-blue-500/20 pb-4">{t("newTitle")}</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start text-white">
                                <Check className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span><strong className="text-blue-200">{t("new1")}</strong> {t("new1Sub")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-white">
                                <Check className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span><strong className="text-blue-200">{t("new2")}</strong> {t("new2Sub")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-white">
                                <Check className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span><strong className="text-blue-200">{t("new3")}</strong> {t("new3Sub")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-white">
                                <Check className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span><strong className="text-blue-200">{t("new4")}</strong> {t("new4Sub")}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
