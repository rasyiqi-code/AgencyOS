import { SystemNav } from "@/components/admin/system-nav";
import { GeneralSettingsForm } from "@/components/admin/system/general-settings-form";
import { getSystemSettings } from "@/lib/server/settings";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
    const settings = await getSystemSettings(["CONTACT_EMAIL", "CONTACT_PHONE", "CONTACT_TELEGRAM", "CONTACT_ADDRESS", "AGENCY_NAME", "COMPANY_NAME", "AGENCY_LOGO", "AGENCY_LOGO_DISPLAY", "CONTACT_HOURS"]);

    const contactData = {
        email: settings.find(s => s.key === "CONTACT_EMAIL")?.value || null,
        phone: settings.find(s => s.key === "CONTACT_PHONE")?.value || null,
        telegram: settings.find(s => s.key === "CONTACT_TELEGRAM")?.value || null,
        address: settings.find(s => s.key === "CONTACT_ADDRESS")?.value || null,
        agencyName: settings.find(s => s.key === "AGENCY_NAME")?.value || null,
        companyName: settings.find(s => s.key === "COMPANY_NAME")?.value || null,
        logoUrl: settings.find(s => s.key === "AGENCY_LOGO")?.value || null,
        logoDisplayMode: settings.find(s => s.key === "AGENCY_LOGO_DISPLAY")?.value || "both",
        servicesTitle: null,
        servicesSubtitle: null,
        hours: settings.find(s => s.key === "CONTACT_HOURS")?.value || null,
    };

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter title="General Settings" />

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Context/Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <GeneralSettingsForm initialData={contactData} />
                </div>
            </div>
        </div>
    );
}
