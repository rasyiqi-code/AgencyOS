import { ClientDashboardContent } from "@/components/public/client-dashboard-content";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/config/db";

export const dynamic = "force-dynamic";

import { ResolvingMetadata } from "next";
import { getSystemSettings } from "@/lib/server/settings";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: {
            path: "/client-dashboard"
        }
    });

    const isId = locale === 'id';

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || "Client Dashboard";
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || "Transparent project tracking, direct communication with engineers, and no-meeting workflow.";
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

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
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/client-dashboard`
        }
    };
}

export default async function ClientDashboardPage() {
    // ⚡ Bolt Optimization: Replace direct DB query with cached getSystemSettings
    // 🎯 Why: Prevents N+1 database queries during SSR across the component tree
    // 📊 Impact: Significantly reduces database load and improves page generation time
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return <ClientDashboardContent agencyName={agencyName} />;
}
