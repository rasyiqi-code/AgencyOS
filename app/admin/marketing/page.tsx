import { redirect } from "next/navigation";

interface PageProps {
    searchParams: Promise<{ mode?: string }>;
}

/**
 * Root page untuk Marketing Center.
 * Melakukan redirect server-side secara instan ke sub-halaman Campaigns demi modularitas.
 */
export default async function MarketingPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const mode = params?.mode || "digital";
    
    // Redirect langsung ke tab default (Campaigns) dengan meneruskan parameter mode
    redirect(`/admin/marketing/campaigns?mode=${mode}`);
}
