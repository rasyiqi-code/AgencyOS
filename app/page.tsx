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
import { SectionStats } from "@/components/landing/section-stats";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/section-faq";
import { Testimonials } from "@/components/landing/section-testimonials";
import { ScrollAnimationWrapper } from "@/components/ui/scroll-animation-wrapper";
import { JsonLd } from "@/components/seo/json-ld";
import { Organization } from "schema-dts";
import { prisma } from "@/lib/config/db";
import { Metadata } from "next";
import { SystemSetting } from "@prisma/client";

export async function generateMetadata(): Promise<Metadata> {
  const pageSeo = await prisma.pageSeo.findUnique({
    where: {
      path: "/",
    }
  });

  if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
    return {};
  }

  return {
    title: pageSeo.title || undefined,
    description: pageSeo.description || undefined,
  };
}

export default async function Home() {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["AGENCY_NAME", "AGENCY_LOGO", "CONTACT_PHONE"] } }
  });
  const agencyName = settings.find((s: SystemSetting) => s.key === "AGENCY_NAME")?.value || "Agency OS";

  return (
    <main className="min-h-screen bg-black selection:bg-blue-500/30">
      <JsonLd<Organization>
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: agencyName,
          url: process.env.NEXT_PUBLIC_APP_URL || "",
          logo: settings.find((s: SystemSetting) => s.key === "AGENCY_LOGO")?.value || "",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: settings.find((s: SystemSetting) => s.key === "CONTACT_PHONE")?.value || "",
            contactType: "customer service"
          }
        }}
      />
      <SiteHeader />
      <LandingHero />

      <ScrollAnimationWrapper>
        <SectionStats />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.1}>
        <SocialProof />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.2}>
        <Comparison />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <FinancialLogic />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <SectionEcosystem />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <Workflow />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <ProductCatalog />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <Testimonials />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <ExpertProfile />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <SectionGuarantee />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <FAQSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <SectionCTA />
      </ScrollAnimationWrapper>
      <SiteFooter />
    </main>
  );
}

