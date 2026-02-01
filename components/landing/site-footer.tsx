import Link from "next/link";
import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";

import Image from "next/image";

export async function SiteFooter() {
    const t = await getTranslations("Footer");

    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME", "COMPANY_NAME", "LOGO_URL", "LOGO_DISPLAY_MODE"] } }
    });
    const agencyName = settings.find((s: { key: string; value: string }) => s.key === "AGENCY_NAME")?.value || "Agency OS";
    const companyName = settings.find((s: { key: string; value: string }) => s.key === "COMPANY_NAME")?.value || "AgencyOS";
    const logoUrl = settings.find((s: { key: string; value: string }) => s.key === "LOGO_URL")?.value;
    const logoDisplayMode = settings.find((s: { key: string; value: string }) => s.key === "LOGO_DISPLAY_MODE")?.value || "both";

    const showLogo = logoDisplayMode === "both" || logoDisplayMode === "logo";
    const showText = logoDisplayMode === "both" || logoDisplayMode === "text";

    return (
        <footer className="border-t border-white/5 bg-black py-6 text-zinc-400">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 uppercase tracking-widest font-bold">
                <div className="flex items-center gap-2">
                    {showLogo && (
                        logoUrl ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-6 w-6 rounded-full bg-brand-grey flex items-center justify-center">
                                <Check className="h-3 w-3 text-brand-yellow stroke-[3]" />
                            </div>
                        )
                    )}
                    {showText && (
                        <span className="font-semibold text-white tracking-normal text-sm">{agencyName}</span>
                    )}
                </div>

                <div className="text-[10px]">
                    © {new Date().getFullYear()} {companyName}. {t("copyright")}
                </div>

                <div className="flex gap-6 text-[10px]">
                    <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">{t("privacy")}</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">{t("terms")}</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">{t("contactUs")}</Link>
                </div>
            </div>
        </footer>
    );
}
