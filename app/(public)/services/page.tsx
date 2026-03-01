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

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
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

    const previousImages = (await parent).openGraph?.images || [];
    const ogImage = (isId ? pageSeo?.ogImage_id : null) || pageSeo?.ogImage;
    const ogImages = ogImage ? [ogImage] : previousImages;

    return {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: {
            title,
            description,
            images: ogImages,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImages,
        },
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
            {/* ProfessionalService JSON-LD Schema for AI/GEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        itemListElement: services.map((s: Service, index: number) => ({
                            "@type": "ListItem",
                            position: index + 1,
                            item: {
                                "@type": "Service",
                                name: s.title,
                                description: s.description,
                                offers: {
                                    "@type": "Offer",
                                    price: s.price,
                                    priceCurrency: s.currency,
                                },
                                url: `${process.env.NEXT_PUBLIC_APP_URL}/services${s.slug ? `#${s.slug}` : ""}`,
                            },
                        })),
                    }),
                }}
            />
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
