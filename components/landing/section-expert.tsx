import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getSystemSettings } from "@/lib/server/settings";

export async function ExpertProfile() {
    const t = await getTranslations("Expert");
    // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="py-16 md:py-24 bg-black overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 lg:gap-16 max-w-6xl mx-auto relative">
                    {/* Background Decorative Text - More Subtle & Integrated */}
                    <div className="absolute top-0 left-0 -translate-x-12 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] whitespace-nowrap hidden lg:block">
                        <span className="text-[12rem] font-black italic tracking-tighter text-white [text-shadow:0_0_20px_rgba(255,255,255,0.1)] [-webkit-text-stroke:1px_rgba(255,255,255,0.5)] [color:transparent]">
                            EXPERT
                        </span>
                    </div>

                    <div className="shrink-0 relative group">
                        <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-3xl overflow-hidden bg-zinc-900 relative z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] border border-white/5">
                            <Image
                                src="/expert-photo.png"
                                alt="Rasyiqi"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                unoptimized
                                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 288px"
                            />
                        </div>

                        {/* Status Badge - Adjusted for mobile center position */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[-2rem] lg:translate-x-0 z-20 bg-brand-yellow px-4 py-1.5 rounded-xl shadow-2xl rotate-2 lg:rotate-6 flex items-center gap-2 border-[3px] border-black">
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wider">
                                {t("badge")}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 sm:space-y-8 text-center lg:text-left relative z-10 pt-4 lg:pt-0">
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-brand-yellow text-[9px] sm:text-xs font-bold tracking-[.4em] uppercase opacity-90">
                                {t("role")}
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white italic leading-[1.15] tracking-tight">
                                &ldquo;{t("quote")}&rdquo;
                            </h2>
                        </div>

                        <div className="max-w-2xl lg:ml-0 mx-auto space-y-5 sm:space-y-6">
                            <p className="text-zinc-400 text-[10px] sm:text-xs md:text-sm lg:text-base leading-relaxed antialiased font-light">
                                {t("description", { brand: agencyName })}
                            </p>

                            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 border-t border-white/10 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold text-zinc-500">
                                <span className="text-zinc-300">{t("name")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
