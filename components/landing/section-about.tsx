import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getSystemSettings } from "@/lib/server/settings";

export async function AboutSection() {
    const t = await getTranslations("About");
    // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <section className="py-16 md:py-24 bg-black overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 max-w-5xl mx-auto relative text-center lg:text-left">
                    {/* Background Decorative Text */}
                    <div className="absolute top-1/2 lg:top-0 left-1/2 lg:left-0 -translate-x-1/2 lg:-translate-x-12 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] whitespace-nowrap hidden sm:block">
                        <span className="text-[10rem] md:text-[14rem] font-black italic tracking-tighter text-white [text-shadow:0_0_20px_rgba(255,255,255,0.1)] [-webkit-text-stroke:1px_rgba(255,255,255,0.5)] [color:transparent]">
                            ABOUT
                        </span>
                    </div>

                    {/* Image Block */}
                    <div className="shrink-0 relative group w-full max-w-md lg:max-w-none lg:w-[45%] mx-auto lg:mx-0">
                        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900 relative z-10 border border-white/5">
                            <Image
                                src="/agency-tech-expert.png"
                                alt={agencyName}
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                            />
                        </div>

                        {/* Status Badge */}
                        <div className="absolute -bottom-4 left-1/2 lg:left-auto lg:right-[-1rem] -translate-x-1/2 lg:translate-x-0 z-20 bg-brand-yellow px-5 py-2 rounded-xl shadow-2xl flex items-center gap-2 border-[3px] border-black rotate-2 lg:-rotate-2">
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-black text-black uppercase tracking-wider whitespace-nowrap">
                                {t("badge")}
                            </span>
                        </div>
                    </div>

                    {/* Text Block */}
                    <div className="flex-1 space-y-6 sm:space-y-8 relative z-10 pt-4 lg:pt-0">
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-brand-yellow text-xs sm:text-sm font-bold tracking-[.4em] uppercase opacity-90">
                                {t("role")}
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white italic leading-[1.15] tracking-tight">
                                &ldquo;{t("quote")}&rdquo;
                            </h2>
                        </div>

                        <div className="max-w-2xl mx-auto lg:mx-0 space-y-5 sm:space-y-6">
                            <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed antialiased font-light">
                                {t("description", { brand: agencyName })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
