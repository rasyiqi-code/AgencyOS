import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/config/db";

export async function Comparison() {
    const t = await getTranslations("Comparison");

    // Fetch Agency Name
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="py-24 bg-brand-yellow relative overflow-hidden">
            {/* Pola background grid yang premium (disesuaikan untuk bg kuning) */}
            <div className="absolute inset-0 z-0 opacity-[0.1] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Elemen dekoratif blur (gelap untuk kedalaman) */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-black/5 blur-[120px] rounded-full" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter">
                        {t("title", { brand: agencyName })}
                    </h2>
                    <p className="text-black/70 font-medium max-w-2xl mx-auto">{t("subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Traditional */}
                    <div className="p-8 rounded-2xl border border-black/10 bg-white shadow-xl transform hover:scale-[1.01] transition-all duration-500">
                        <h3 className="text-xl font-bold text-black/50 mb-8 border-b border-black/5 pb-4 uppercase tracking-widest">{t("oldTitle")}</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start text-zinc-900 font-bold">
                                <X className="w-5 h-5 text-red-600 shrink-0 mt-1" strokeWidth={3} />
                                <span className="tracking-tight">{t("old1")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-zinc-900 font-bold">
                                <X className="w-5 h-5 text-red-600 shrink-0 mt-1" strokeWidth={3} />
                                <span className="tracking-tight">{t("old2")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-zinc-900 font-bold">
                                <X className="w-5 h-5 text-red-600 shrink-0 mt-1" strokeWidth={3} />
                                <span className="tracking-tight">{t("old3")}</span>
                            </li>
                            <li className="flex gap-4 items-start text-zinc-900 font-bold">
                                <X className="w-5 h-5 text-red-600 shrink-0 mt-1" strokeWidth={3} />
                                <span className="tracking-tight">{t("old4")}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Agency OS */}
                    <div className="p-8 rounded-2xl border border-black/20 bg-black text-white relative overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                        <div className="absolute top-0 right-0 px-4 py-1 bg-white text-[10px] font-black text-black rounded-bl-xl tracking-tighter shadow-lg">
                            {t("recommended")}
                        </div>
                        <h3 className="text-xl font-black text-brand-yellow mb-8 border-b border-white/10 pb-4 uppercase tracking-tight">
                            {t("newTitle", { brand: agencyName })}
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start">
                                <Check className="w-5 h-5 text-brand-yellow shrink-0 mt-1" strokeWidth={3} />
                                <span className="font-medium"><strong className="text-brand-yellow">{t("new1")}</strong> {t("new1Sub")}</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <Check className="w-5 h-5 text-brand-yellow shrink-0 mt-1" strokeWidth={3} />
                                <span className="font-medium"><strong className="text-brand-yellow">{t("new2")}</strong> {t("new2Sub")}</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <Check className="w-5 h-5 text-brand-yellow shrink-0 mt-1" strokeWidth={3} />
                                <span className="font-medium"><strong className="text-brand-yellow">{t("new3")}</strong> {t("new3Sub")}</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <Check className="w-5 h-5 text-brand-yellow shrink-0 mt-1" strokeWidth={3} />
                                <span className="font-medium"><strong className="text-brand-yellow">{t("new4")}</strong> {t("new4Sub")}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
