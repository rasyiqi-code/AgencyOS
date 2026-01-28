import { SiteHeader } from "@/components/landing/site-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { SectionEcosystem } from "@/components/landing/section-ecosystem";
import { SocialProof } from "@/components/landing/section-social-proof";
import { Comparison } from "@/components/landing/section-comparison";
import { ProductCatalog } from "@/components/landing/section-products";
import { Workflow } from "@/components/landing/section-workflow";
import { ExpertProfile } from "@/components/landing/section-expert";
import { FinancialLogic } from "@/components/landing/section-financial";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/section-faq";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Footer");

  return (
    <main className="min-h-screen bg-black selection:bg-blue-500/30">
      <SiteHeader />
      <LandingHero />
      <SectionEcosystem />
      <SocialProof />
      <Comparison />
      <FinancialLogic />
      <ProductCatalog />
      <Workflow />
      <SectionGuarantee />
      <ExpertProfile />
      <FAQSection />

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black text-center">
        <div className="container mx-auto px-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">{t("ctaTitle")}</h2>
            <Link href="/price-calculator">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200 cursor-pointer">
                {t("ctaButton")}
              </Button>
            </Link>
          </div>

          <div className="flex justify-center gap-6 text-sm text-zinc-500">
            <Link href="/handler/sign-in" className="hover:text-white">{t("clientLogin")}</Link>
            <Link href="/services" className="hover:text-white">{t("services")}</Link>
            <Link href="/contact" className="hover:text-white">{t("contactUs")}</Link>
            <Link href="/support" className="hover:text-white">{t("supportHelp")}</Link>
            <Link href="#" className="hover:text-white">{t("terms")}</Link>
            <Link href="#" className="hover:text-white">{t("privacy")}</Link>
          </div>

          <p className="text-zinc-600 text-xs">
            {t("copyright")}
          </p>
        </div>
      </footer>
    </main>
  );
}
