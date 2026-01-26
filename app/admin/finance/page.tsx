
import { canManageBilling } from "@/lib/auth-helpers";
import { BillingDashboardView } from "@/components/admin/views/billing-view";
import { redirect } from "next/navigation";


export default async function FinanceDashboardPage() {
    // Permission Check
    const hasAccess = await canManageBilling();

    if (!hasAccess) {
        redirect('/dashboard');
    }

    return (
        <div className="flex flex-col gap-4">
            <BillingDashboardView />
        </div>
    );
}
