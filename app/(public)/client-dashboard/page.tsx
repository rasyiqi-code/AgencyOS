import { ClientDashboardContent } from "@/components/public/client-dashboard-content";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/config/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
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

    return {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: pageSeo?.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/client-dashboard`
        }
    };
}

export default async function ClientDashboardPage() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return <ClientDashboardContent agencyName={agencyName} />;
}
