
import { prisma } from "@/lib/config/db";
import { Badge } from "@/components/ui/badge";
import { SystemNav } from "@/components/admin/system-nav";
import { PageSeoList } from "@/components/admin/system/page-seo-list";
import { Search } from "lucide-react";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export const dynamic = "force-dynamic";

export default async function AdminSeoPagesPage() {
    const pages = await prisma.pageSeo.findMany({
        orderBy: { path: 'asc' }
    });

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter title="Page Manager" />

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <PageSeoList initialPages={pages} />
                </div>
            </div>
        </div>
    );
}
