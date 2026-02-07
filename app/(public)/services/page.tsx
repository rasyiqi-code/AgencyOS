import { prisma } from "@/lib/config/db";
import { ServicesClientWrapper } from "@/components/public/services-client-wrapper";
import { Metadata } from "next";
import { Service } from "@prisma/client";
import { Testimonials } from "@/components/landing/section-testimonials";
import { SectionIncluded } from "@/components/landing/section-included";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/section-faq";



import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: {
            path: "/services"
        }
    });

    const isId = locale === 'id';

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || "Services";
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || "Explore our premium productized services. Transparent pricing, rapid delivery, and professional quality.";
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: pageSeo?.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/services`
        }
    };
}

export default async function PublicServicesPage() {
    // Parallel data fetching for performance
    const [services] = await Promise.all([
        prisma.service.findMany({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        })
    ]);

    // Transform to match interface (handle potential type mismatches safely)
    const processedServices = services.map((s: Service) => ({
        ...s,
        features: s.features as unknown,
        features_id: s.features_id as unknown
    }));

    return (
        <div className="flex flex-col">
            <ServicesClientWrapper
                services={processedServices}
            />
            {/* Landing style components to make the page complete */}
            <Testimonials />
            <SectionIncluded />
            <SectionGuarantee />
            <FAQSection />
        </div>
    );
}
