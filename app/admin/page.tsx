
import { isAdmin, canManageProjects, canManageBilling } from "@/lib/auth-helpers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Views
import { SuperAdminDashboardView } from "@/components/admin/views/super-admin-view";
import { BillingDashboardView } from "@/components/admin/views/billing-view";
import { ProjectDashboardView } from "@/components/admin/views/project-view";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { AlertTriangle } from "lucide-react";


interface PageProps {
    searchParams: Promise<{ view?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
    const hasAccess = await isAdmin();
    if (!hasAccess) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Access Restricted</h1>
                    <p className="text-zinc-400">You do not have permission to view the Admin Command Center.</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="mt-4">Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Determine specific roles
    const isProjectAdmin = await canManageProjects();
    const isBillingAdmin = await canManageBilling();

    // Await searchParams properly (Next.js 15 pattern, safe for older versions too)
    const params = await searchParams;
    const requestedView = params?.view;

    // Check gateway status
    const hasGateway = await paymentGatewayService.hasActiveGateway();

    // 1. Super Admin Logic (Can Switch)
    // If user has both permissions (or is super_admin), show switcher
    if (isProjectAdmin && isBillingAdmin) {
        return (
            <div className="flex flex-col gap-4">
                {!hasGateway && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-4 mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-amber-500">Gateway Pembayaran Belum Aktif</h3>
                            <p className="text-xs text-amber-500/70 mt-1">
                                Midtrans atau Creem belum dikonfigurasi. Pelanggan akan diarahkan ke transfer bank manual.
                                <Link href="/admin/system/payment" className="ml-1 underline font-medium">Konfigurasi Sekarang</Link>
                            </p>
                        </div>
                    </div>
                )}

                {requestedView === 'finance' ? (
                    <BillingDashboardView />
                ) : requestedView === 'project' ? (
                    <ProjectDashboardView />
                ) : (
                    <SuperAdminDashboardView />
                )}
            </div>
        );
    }

    // 2. Billing Admin Only
    // Force finance view regardless of URL param
    if (isBillingAdmin) {
        return <BillingDashboardView />;
    }

    // 3. Project Admin Only
    // Force project view regardless of URL param
    if (isProjectAdmin) {
        return <ProjectDashboardView />;
    }

    // 4. Default / Fallback
    return (
        <div className="py-10 text-center">
            <h1 className="text-xl text-zinc-400">Welcome to Admin Panel</h1>
            <p className="text-sm text-zinc-500">Your role has limited access. Check the sidebar for available actions.</p>
        </div>
    );
}
