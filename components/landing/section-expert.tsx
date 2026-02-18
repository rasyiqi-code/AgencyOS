import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { prisma } from "@/lib/config/db";

export async function ExpertProfile() {
    const t = await getTranslations("Expert");
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto rounded-3xl bg-zinc-900/30 border border-white/5 p-8 md:p-12">
                    <div className="shrink-0 text-center">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden mx-auto mb-4 bg-zinc-800 relative shadow-2xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                            <Image
                                src="/expert-photo.png"
                                alt="Rasyiqi"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <h3 className="text-white font-bold text-lg">{t("name")}</h3>
                        <p className="text-indigo-400 text-sm mb-2">{t("role")}</p>
                        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-wider text-white/70 border border-white/5">
                            {t("badge")}
                        </span>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-white italic">
                            &ldquo;{t("quote")}&rdquo;
                        </h2>
                        <div className="space-y-4 text-zinc-400 leading-relaxed text-sm md:text-base">
                            <p>
                                {t("description", { brand: agencyName })}
                            </p>
                            <p className="text-white font-medium pt-2 border-t border-white/5 mt-4">
                                {t("footer")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
