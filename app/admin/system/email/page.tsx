import { Mail } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { ResendConfigForm } from "@/components/admin/system/resend-config-form";
import { prisma } from "@/lib/db";
// import { getResendKey, getAdminTargetEmail } from "@/app/actions/email";

export default async function AdminEmailPage() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["RESEND_API_KEY", "ADMIN_EMAIL_TARGET"] } }
    });
    const resendApiKey = settings.find(s => s.key === "RESEND_API_KEY")?.value || null;
    const adminTargetEmail = settings.find(s => s.key === "ADMIN_EMAIL_TARGET")?.value || null;

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">System Configuration</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Email Service
                        <Mail className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Configure email delivery settings and provider integrations.
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
                    <ResendConfigForm currentKey={resendApiKey} currentTargetEmail={adminTargetEmail} />
                </div>
            </div>
        </div>
    );
}
