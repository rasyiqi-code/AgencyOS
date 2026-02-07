
import { prisma } from "@/lib/config/db";
import { Badge } from "@/components/ui/badge";
import { SystemNav } from "@/components/admin/system-nav";
import { PageSeoList } from "@/components/admin/system/page-seo-list";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSeoPagesPage() {
    const pages = await prisma.pageSeo.findMany({
        orderBy: { path: 'asc' }
    });

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">System Control</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Page SEO Manager
                        <Search className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Customize meta tags, titles, and content for specific pages.
                    </p>
                </div>
            </div>

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
