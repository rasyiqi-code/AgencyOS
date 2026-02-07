
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/config/db";

import { cookies } from "next/headers";

export async function ProjectDashboardView() {
    // Fetch Project Specific Stats
    const stats = await prisma.$transaction(async (tx) => {
        const activeProjects = await tx.project.count({
            where: { status: { in: ['queue', 'dev'] } }
        });
        const totalClients = await tx.project.groupBy({
            by: ['userId'],
        });
        return { activeProjects, totalClients: totalClients.length };
    });

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    return (
        <div className="flex flex-col gap-6 w-full py-6">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-4">{isId ? 'Papan Manajemen Proyek' : 'Project Management Board'}</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-zinc-900/40 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">{isId ? 'Proyek Aktif' : 'Active Projects'}</CardTitle>
                        <Layers className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
                        <p className="text-xs text-zinc-500 mt-1">{isId ? 'Perlu pembaruan' : 'Updates required'}</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">{isId ? 'Klien Unik' : 'Unique Clients'}</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-6">
                <Link href="/admin/pm/projects" className="group">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{isId ? 'Akses Registri Proyek' : 'Access Project Registry'}</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500">{isId ? 'Tetapkan tim, perbarui status, dan tinjau spesifikasi.' : 'Assign squads, update statuses, and review specs.'}</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
