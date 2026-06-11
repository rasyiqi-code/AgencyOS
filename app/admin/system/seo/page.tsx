
import { Globe } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { SeoSettingsForm } from "@/components/admin/system/seo-settings-form";
import { getSystemSettings } from "@/lib/server/settings";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
    // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
    const settings = await getSystemSettings(["SEO_TITLE", "SEO_TITLE_ID", "SEO_DESCRIPTION", "SEO_DESCRIPTION_ID", "SEO_KEYWORDS", "SEO_KEYWORDS_ID", "SEO_OG_IMAGE", "SEO_FAVICON", "SEO_GOOGLE_VERIFICATION", "SEO_GA_ID"]);

    const seoData = {
        title: settings.find(s => s.key === "SEO_TITLE")?.value || null,
        title_id: settings.find(s => s.key === "SEO_TITLE_ID")?.value || null,
        description: settings.find(s => s.key === "SEO_DESCRIPTION")?.value || null,
        description_id: settings.find(s => s.key === "SEO_DESCRIPTION_ID")?.value || null,
        keywords: settings.find(s => s.key === "SEO_KEYWORDS")?.value || null,
        keywords_id: settings.find(s => s.key === "SEO_KEYWORDS_ID")?.value || null,
        ogImage: settings.find(s => s.key === "SEO_OG_IMAGE")?.value || null,
        favicon: settings.find(s => s.key === "SEO_FAVICON")?.value || null,
        googleVerification: settings.find(s => s.key === "SEO_GOOGLE_VERIFICATION")?.value || null,
        gaId: settings.find(s => s.key === "SEO_GA_ID")?.value || null,
    };

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter title="SEO / Metadata" />

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Context/Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <SeoSettingsForm initialData={seoData} />
                </div>
            </div>
        </div>
    );
}
