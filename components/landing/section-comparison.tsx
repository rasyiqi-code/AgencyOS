import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";

export async function Comparison() {
    const t = await getTranslations("Comparison");

    // Fetch Agency Name
    // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="py-16 bg-brand-yellow relative overflow-hidden">
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
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter whitespace-pre-line">
                        {t("title", { brand: agencyName })}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                    {/* Traditional */}
                    <div className="p-6 rounded-2xl border border-black/10 bg-white shadow-xl transform hover:scale-[1.01] transition-all duration-500">
                        <h3 className="text-lg font-bold text-black/50 mb-6 border-b border-black/5 pb-3 uppercase tracking-widest">{t("oldTitle")}</h3>
                        <ul className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <li key={i} className="flex gap-4 items-start text-zinc-900">
                                    <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={3} />
                                    <span className="tracking-tight text-sm md:text-base font-medium leading-tight">
                                        <strong className="font-bold">{t(`old${i}`)}</strong> {t(`old${i}Sub`)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Agency OS */}
                    <div className="p-6 rounded-2xl border border-black/20 bg-black text-white relative overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
                        <div className="absolute top-0 right-0 px-4 py-1 bg-white text-[10px] font-black text-black rounded-bl-xl tracking-tighter shadow-lg">
                            {t("recommended")}
                        </div>
                        <h3 className="text-lg font-black text-brand-yellow mb-6 border-b border-white/10 pb-3 uppercase tracking-tight">
                            {t("newTitle", { brand: agencyName })}
                        </h3>
                        <ul className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <li key={i} className="flex gap-4 items-start">
                                    <Check className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" strokeWidth={3} />
                                    <span className="text-sm md:text-base font-medium leading-tight">
                                        <strong className="text-brand-yellow">{t(`new${i}`)}</strong> {t(`new${i}Sub`)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
