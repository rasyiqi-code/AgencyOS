import { redirect } from "next/navigation";

interface PageProps {
    searchParams: Promise<{ mode?: string }>;
}

/**
 * Root page untuk Marketing Center.
 * Melakukan redirect server-side secara instan ke sub-halaman pertama yang aktif (Promotions) dengan meneruskan parameter mode.
 */
export default async function MarketingPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const mode = params?.mode || "digital";
    
    // Redirect langsung ke Promotions
    redirect(`/admin/marketing/promotions?mode=${mode}`);
}
