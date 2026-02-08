import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { MissionCard } from "@/components/dashboard/missions/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link"; // Added Link import
import { type ExtendedProject } from "@/lib/shared/types";

import { cookies } from "next/headers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MissionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const user = await stackServerApp.getUser();
    const { q } = await searchParams; // Await searchParams

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    const allProjects = await prisma.project.findMany({
        where: {
            userId: user?.id,
            status: { not: 'payment_pending' },
            ...(q ? {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } }
                ]
            } : {})
        },
        orderBy: { createdAt: 'desc' },
        include: {
            service: true,
            estimate: {
                include: { service: true }
            },
            briefs: true,
            dailyLogs: true,
            feedback: true
        }
    }) as unknown as ExtendedProject[];

    // Split projects into Active Subscriptions and History/One-time
    // Subscribed if: subscriptionStatus is active OR it's a service with non-one-time billing
    const subscribedProjects = allProjects.filter(p =>
        (p.subscriptionStatus === 'active' && !p.estimateId) ||
        (p.service && p.service.interval !== 'one_time')
    );
    const historyProjects = allProjects.filter(p =>
        (p.subscriptionStatus !== 'active' || !!p.estimateId) &&
        !(p.service && p.service.interval !== 'one_time')
    );

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{isId ? 'Log Misi' : 'Mission Log'}</h1>
                    <p className="text-zinc-400 mt-1">{isId ? 'Semua operasi aktif dan yang diarsipkan.' : 'All active and archived operations.'}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <form className="relative w-full md:w-64">
                        {/* Simple server-side search form */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            name="q"
                            placeholder={isId ? 'Cari misi...' : 'Search missions...'}
                            className="bg-zinc-900/50 border-white/10 pl-9 w-full"
                            defaultValue={q}
                        />
                    </form>
                    <Link href="/price-calculator">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-semibold cursor-pointer">
                            {isId ? '+ Misi Baru' : '+ New Mission'}
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="subscriptions" className="w-full">
                <TabsList className="bg-zinc-900/50 border border-white/5 mb-6">
                    <TabsTrigger value="subscriptions" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black">
                        {isId ? 'Langganan Aktif' : 'Active Subscriptions'}
                        {subscribedProjects.length > 0 && (
                            <span className="ml-2 bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full">
                                {subscribedProjects.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                        {isId ? 'Riwayat & Proyek' : 'History & Projects'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="subscriptions" className="mt-0">
                    {subscribedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-900/20">
                            <p className="text-zinc-500">{isId ? 'Tidak ada langganan aktif saat ini.' : 'No active subscriptions found.'}</p>
                            <Link href="/dashboard/services">
                                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                                    {isId ? 'Jelajahi Layanan' : 'Browse Services'}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subscribedProjects.map((project) => (
                                <MissionCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    {historyProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-900/20">
                            <p className="text-zinc-500">{isId ? 'Tidak ada riwayat proyek yang ditemukan.' : 'No project history found.'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {historyProjects.map((project) => (
                                <MissionCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
