"use client";

import { usePathname } from "next/navigation";
import { SidebarSuperAdmin, SidebarFinance, SidebarPM } from "@/components/dashboard/sidebar/roles";

interface Props {
    pmAccess: boolean;
    financeAccess: boolean;
}

export function AdminSidebarNavigation({ pmAccess, financeAccess }: Props) {
    const pathname = usePathname();

    // Normalize path to ignore locale (e.g. /id/admin... -> /admin...)
    const cleanPath = pathname.replace(/^\/(en|id)/, "");

    // 1. Finance View
    if (cleanPath.startsWith("/admin/finance")) {
        // Validation: Ensure user actually has access
        if (financeAccess) {
            return <SidebarFinance />;
        }
    }

    // 2. Project View
    if (cleanPath.startsWith("/admin/pm")) {
        // Validation: Ensure user actually has access
        if (pmAccess) {
            return <SidebarPM />;
        }
    }

    // 3. Default / Command Center View
    // This usually means they are at /admin root or trying to access something general

    // Priority: Super Admin (Both)
    if (pmAccess && financeAccess) {
        return <SidebarSuperAdmin />;
    }

    // Fallback: If they are here but only have one role, show their specific sidebar
    // regardless of the URL (to avoid showing empty or wrong sidebar)
    if (financeAccess) {
        return <SidebarFinance />;
    }

    if (pmAccess) {
        return <SidebarPM />;
    }

    return null;
}
