import { ShieldCheck, MessageSquare, UserCheck, HeartHandshake, Gauge, Code2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/config/db";
import { ScrollAnimationWrapper } from "@/components/ui/scroll-animation-wrapper";


export async function SectionIncluded() {
    const t = await getTranslations("Included");
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    const features = [
        { icon: ShieldCheck, title: t("f1"), desc: t("f1Desc") },
        { icon: MessageSquare, title: t("f2"), desc: t("f2Desc") },
        { icon: UserCheck, title: t("f3"), desc: t("f3Desc") },
        { icon: HeartHandshake, title: t("f4"), desc: t("f4Desc") },
        { icon: Gauge, title: t("f5"), desc: t("f5Desc") },
        { icon: Code2, title: t("f6"), desc: t("f6Desc") },
    ];

    return (
        <section className="py-16 sm:py-24 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-yellow/5 to-transparent pointer-events-none" />
            <div className="container mx-auto px-4 relative z-10">
                <ScrollAnimationWrapper>
                    <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                            {t("title")}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-lg px-4 sm:px-0">
                            {t("subtitle", { brand: agencyName })}
                        </p>
                    </div>
                </ScrollAnimationWrapper>

                {/* Mobile Carousel (Peeking Style) */}
                <div className="md:hidden -mx-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory flex">
                    <div className="flex gap-4 px-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="w-[80vw] flex-shrink-0 snap-center p-6 rounded-2xl bg-white/5 border border-white/10 group active:border-brand-yellow/30 transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center mb-5">
                                    <feature.icon className="w-5 h-5 text-brand-yellow" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-active:text-brand-yellow transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-yellow/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 text-brand-yellow" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-yellow transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
