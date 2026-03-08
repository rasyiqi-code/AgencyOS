import { getPortfolios } from "@/lib/portfolios/actions";
import { getSettingValue } from "@/lib/server/settings";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewDesignClient } from "./view-design-client";
import { getTranslations } from "next-intl/server";

import { ResolvingMetadata } from "next";

// Localized SEO: Preview {Nama Porto} | {AGENCY_NAME}
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const portfolios = await getPortfolios();
    const portfolio = portfolios.find((p) => p.slug === slug);
    const agencyName = await getSettingValue("AGENCY_NAME", "Agency OS");
    const t = await getTranslations("ViewDesign");

    if (!portfolio) {
        return {
            title: `Design Not Found`,
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const title = t("seoTitle", { title: portfolio.title });
    const description = t("seoDescription", { title: portfolio.title, agencyName });

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: previousImages,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: previousImages,
        }
    };
}

export default async function ViewDesignPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [portfolios, agencyName, contactPhone, contactTelegram] = await Promise.all([
        getPortfolios(),
        getSettingValue("AGENCY_NAME", "Agency OS"),
        getSettingValue("CONTACT_PHONE", ""),
        getSettingValue("CONTACT_TELEGRAM", "")
    ]);

    const portfolio = portfolios.find((p) => p.slug === slug);

    if (!portfolio) {
        notFound();
    }

    return (
        <ViewDesignClient
            slug={portfolio.slug}
            title={portfolio.title}
            agencyName={agencyName}
            externalUrl={portfolio.externalUrl}
            contactPhone={contactPhone}
            contactTelegram={contactTelegram}
        />
    );
}
