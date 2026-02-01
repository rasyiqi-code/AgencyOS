import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { SectionCTA } from "@/components/landing/section-cta";
import { SectionEcosystem } from "@/components/landing/section-ecosystem";
import { SocialProof } from "@/components/landing/section-social-proof";
import { Comparison } from "@/components/landing/section-comparison";
import { ProductCatalog } from "@/components/landing/section-products";
import { Workflow } from "@/components/landing/section-workflow";
import { ExpertProfile } from "@/components/landing/section-expert";
import { FinancialLogic } from "@/components/landing/section-financial";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/section-faq";
import { Testimonials } from "@/components/landing/section-testimonials";

export default async function Home() {

  return (
    <main className="min-h-screen bg-black selection:bg-blue-500/30">
      <SiteHeader />
      <LandingHero />
      <SectionEcosystem />
      <SocialProof />
      <Testimonials />
      <Comparison />
      <FinancialLogic />
      <ProductCatalog />
      <Workflow />
      <SectionGuarantee />
      <ExpertProfile />
      <FAQSection />
      <SectionCTA />
      <SiteFooter />
    </main>
  );
}

