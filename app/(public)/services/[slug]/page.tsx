import { getServiceBySlug } from "@/lib/server/services";
import { ServiceDetailContent } from "@/components/public/service-detail";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Testimonials } from "@/components/landing/section-testimonials";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/section-faq";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const dynamic = "force-dynamic";

interface ServicePageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateMetadata(props: ServicePageProps): Promise<Metadata> {
    const params = await props.params;
    const locale = await getLocale();
    const service = await getServiceBySlug(params.slug);

    if (!service) return { title: "Service Not Found" };

    const isId = locale === 'id';
    const title = (isId ? service.title_id : null) || service.title;
    const description = (isId ? service.description_id : null) || service.description;

    // Clean description for meta tag (remove HTML tags)
    const cleanDescription = description.replace(/<[^>]*>?/gm, '').slice(0, 160);

    return {
        title: title,
        description: cleanDescription,
        openGraph: {
            title: title,
            description: cleanDescription,
            images: service.image ? [{ url: service.image }] : undefined,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/services/${params.slug}`
        }
    };
}

export default async function PublicServiceDetailPage(props: ServicePageProps) {
    const params = await props.params;
    const locale = await getLocale();
    const isId = locale === 'id';

    const service = await getServiceBySlug(params.slug);

    if (!service) {
        notFound();
    }

    const title = (isId ? service.title_id : null) || service.title;
    const description = (isId ? service.description_id : null) || service.description || "";
    const cleanDescription = description.replace(/<[^>]*>?/gm, '').slice(0, 160);

    // Social proof avatars (temporarily disabled due to Stack Auth SDK error)
    const trustedAvatars: string[] = [];
    /*
    try {
        const { stackServerApp } = await import("@/lib/config/stack");
        const users = await stackServerApp.listUsers();
        trustedAvatars = users
            .filter(u => !!u.profileImageUrl)
            .map(u => u.profileImageUrl!)
            .slice(0, 5);
    } catch (error) {
        console.error("Failed to fetch trusted avatars:", error);
    }
    */

    // Transform to match interface safely
    const processedService = {
        ...service,
        features: service.features as unknown,
        features_id: service.features_id as unknown
    };

    
    return (
        <div className="flex flex-col">
            <BreadcrumbSchema
                items={[
                    { name: isId ? 'Beranda' : 'Home', item: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}` },
                    { name: isId ? 'Layanan' : 'Services', item: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/services` },
                    { name: title, item: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/services/${service.slug}` },
                ]}
            />
            {/* Service Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "serviceType": title,
                        "provider": {
                            "@type": "Organization",
                            "name": "Crediblemark",
                            "url": process.env.NEXT_PUBLIC_APP_URL
                        },
                        "description": cleanDescription,
                        "areaServed": "Worldwide",
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": title,
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": title
                                    },
                                    "price": service.price,
                                    "priceCurrency": "USD"
                                }
                            ]
                        }
                    })
                }}
            />
            <ServiceDetailContent
                service={processedService}
                isId={isId}
                showBack={true}
                trustedAvatars={trustedAvatars}
            />
            <Testimonials />
            <SectionGuarantee />
            <FAQSection />
        </div>
    );
}
