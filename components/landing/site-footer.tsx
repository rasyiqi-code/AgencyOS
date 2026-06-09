'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

import { getSystemSettings, getAffiliateName } from "@/src/server/settings";

export function SiteFooter() {
    const [settings, setSettings] = useState<{ agencyName: string; companyName: string; logoUrl?: string; logoDisplayMode: string }>({
        agencyName: "Agency OS",
        companyName: "AgencyOS",
        logoUrl: undefined,
        logoDisplayMode: "both",
    });
    const [affiliateName, setAffiliateName] = useState<string | null>(null);

    useEffect(() => {
        getSystemSettings(["AGENCY_NAME", "COMPANY_NAME", "AGENCY_LOGO", "AGENCY_LOGO_DISPLAY"]).then(
            (s: { key: string; value: string }[]) => {
                setSettings({
                    agencyName: s.find(x => x.key === "AGENCY_NAME")?.value || "Agency OS",
                    companyName: s.find(x => x.key === "COMPANY_NAME")?.value || "AgencyOS",
                    logoUrl: s.find(x => x.key === "AGENCY_LOGO")?.value,
                    logoDisplayMode: s.find(x => x.key === "AGENCY_LOGO_DISPLAY")?.value || "both",
                });
            }
        );
        const match = document.cookie.match(/(?:^| )agencyos_affiliate_id=([^;]+)/);
        const affiliateCode = match?.[1];
        if (affiliateCode) {
            getAffiliateName(affiliateCode).then(setAffiliateName);
        }
    }, []);

    const t = useTranslations("Footer");
    const locale = useLocale();

    const { agencyName, companyName, logoUrl, logoDisplayMode } = settings;
    const showLogo = logoDisplayMode === "both" || logoDisplayMode === "logo";
    const showText = logoDisplayMode === "both" || logoDisplayMode === "text";

    return (
        <footer className="border-t border-white/5 bg-black py-8 md:py-6 text-zinc-400">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 font-medium text-center md:text-left">
                <div className="flex items-center gap-2">
                    {showLogo && (
                        logoUrl ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
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

                <div className="text-[10px] order-3 md:order-2">
                    © {new Date().getFullYear()} {companyName}. {t("copyright")}
                    {affiliateName && (
                        <span className="ml-1 text-zinc-500">
                            • Affiliate by {affiliateName}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-6 gap-y-3 text-[10px] order-2 md:order-3">
                    <Link href={`/${locale}/docs`} className="hover:text-white transition-colors">{t("docs")}</Link>
                    <Link href="https://github.com/rasyiqi-code/AgencyOS" target="_blank" className="hover:text-white transition-colors">Changelog</Link>
                    <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{t("privacy")}</Link>
                    <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{t("terms")}</Link>
                    <Link href="/affiliate/join" className="hover:text-white transition-colors">{t("partners")}</Link>
                    <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t("contactUs")}</Link>
                </div>
            </div>
        </footer>
    );
}
