import { SystemNav } from "@/components/admin/system-nav";
import { ResendConfigForm } from "@/components/admin/system/resend-config-form";
import { getSystemSettings } from "@/lib/server/settings";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export default async function AdminEmailPage() {
    // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["RESEND_API_KEY", "ADMIN_EMAIL_TARGET"]);
    const resendApiKey = settings.find(s => s.key === "RESEND_API_KEY")?.value || null;
    const adminTargetEmail = settings.find(s => s.key === "ADMIN_EMAIL_TARGET")?.value || null;

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter title="Email Service" />

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Context/Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <ResendConfigForm currentKey={resendApiKey} currentTargetEmail={adminTargetEmail} />
                </div>
            </div>
        </div>
    );
}
