import { prisma } from "@/lib/config/db";
import { ServiceDetailContent } from "@/components/public/service-detail-content";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Testimonials } from "@/components/landing/section-testimonials";
import { SectionIncluded } from "@/components/landing/section-included";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/section-faq";

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
    const service = await prisma.service.findUnique({
        where: { slug: params.slug }
    });

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

    const service = await prisma.service.findUnique({
        where: { slug: params.slug }
    });

    if (!service) {
        notFound();
    }

    // Fetch users from Stack Auth for social proof avatars
    let trustedAvatars: string[] = [];
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

    // Transform to match interface safely
    const processedService = {
        ...service,
        features: service.features as unknown,
        features_id: service.features_id as unknown
    };

    return (
        <div className="flex flex-col">
            <ServiceDetailContent
                service={processedService}
                isId={isId}
                showBack={true}
                trustedAvatars={trustedAvatars}
            />
            <Testimonials />
            <SectionIncluded />
            <SectionGuarantee />
            <FAQSection />
        </div>
    );
}
