import { Settings2 } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { GeneralSettingsForm } from "@/components/admin/system/general-settings-form";
import { prisma } from "@/lib/db";
// import { getContactInfo } from "@/app/actions/general";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["CONTACT_EMAIL", "CONTACT_PHONE", "CONTACT_ADDRESS", "LOGO_URL", "AGENCY_NAME", "COMPANY_NAME", "LOGO_DISPLAY_MODE"] } }
    });

    const contactInfo = {
        email: settings.find(s => s.key === "CONTACT_EMAIL")?.value || null,
        phone: settings.find(s => s.key === "CONTACT_PHONE")?.value || null,
        address: settings.find(s => s.key === "CONTACT_ADDRESS")?.value || null,
        logoUrl: settings.find(s => s.key === "LOGO_URL")?.value || null,
        agencyName: settings.find(s => s.key === "AGENCY_NAME")?.value || null,
        companyName: settings.find(s => s.key === "COMPANY_NAME")?.value || null,
        logoDisplayMode: settings.find(s => s.key === "LOGO_DISPLAY_MODE")?.value || 'both',
    };

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">System Configuration</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        General Settings
                        <Settings2 className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Manage global system parameters and default behaviors.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Context/Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <GeneralSettingsForm initialData={contactInfo} />
                </div>
            </div>
        </div>
    );
}
