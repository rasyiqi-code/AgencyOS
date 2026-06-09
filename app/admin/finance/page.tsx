import { canManageBilling } from "@/lib/shared/auth-helpers";
import { BillingDashboardView } from "@/components/admin/views/billing-view";
import { redirect } from "next/navigation";
import { DashboardModeSwitcher } from "@/components/admin/dashboard-mode-switcher";

interface PageProps {
    searchParams: Promise<{ mode?: string }>;
}

export default async function FinanceDashboardPage({ searchParams }: PageProps) {
    // Permission Check
    const hasAccess = await canManageBilling();

    if (!hasAccess) {
        redirect('/dashboard');
    }

    const params = await searchParams;
    const mode = params?.mode || 'services';

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end pt-2">
                <DashboardModeSwitcher />
            </div>
            <BillingDashboardView mode={mode} />
        </div>
    );
}
