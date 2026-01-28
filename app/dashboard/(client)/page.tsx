import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { OverviewHeader } from "@/components/dashboard/header/overview";
import { MissionCard } from "@/components/dashboard/missions/card";
import { FinanceWidget } from "@/components/dashboard/widgets/finance";
import { QuickActions } from "@/components/dashboard/widgets/quick-actions";
import { getTranslations } from "next-intl/server";
import { type ExtendedProject } from "@/lib/types";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await stackServerApp.getUser();
    const t = await getTranslations("Dashboard.Overview");

    const projects = (await prisma.project.findMany({
        where: {
            userId: user?.id,
            status: { not: 'payment_pending' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            briefs: true,
            dailyLogs: true,
            feedback: true,
            service: true,
            estimate: {
                include: { service: true }
            }
        }
    })) as unknown as ExtendedProject[];

    // Fetch financial data
    const paidOrders = await prisma.order.findMany({
        where: {
            userId: user?.id,
            status: 'paid'
        },
        select: { amount: true }
    });

    const totalInvestment = paidOrders.reduce((sum, order) => sum + order.amount, 0);

    const nextInvoice = await prisma.order.findFirst({
        where: {
            userId: user?.id,
            status: 'pending'
        },
        orderBy: { createdAt: 'asc' }
    });

    const activeProject = projects.find(p => p.status === 'dev');

    return (
        <div className="pb-10">
            {/* Header */}
            <OverviewHeader user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column: Missions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Mission Highlight */}
                    {activeProject && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white tracking-tight">{t("activeMission")}</h2>
                                <span className="text-xs font-mono text-blue-400 animate-pulse">● {t("liveUpdate")}</span>
                            </div>
                            <MissionCard project={activeProject} />
                        </div>
                    )}

                    {/* Recent Missions Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">{t("recentMissions")}</h2>
                        </div>

                        {projects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
                                <p className="text-zinc-500">{t("noMissions")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.filter(p => p.id !== activeProject?.id).map((project) => (
                                    <MissionCard key={project.id} project={project} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <FinanceWidget
                        totalInvestment={totalInvestment}
                        nextInvoice={nextInvoice}
                    />

                    <div>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">{t("quickActions")}</h3>
                        <QuickActions />
                    </div>

                    {/* Support Widget */}
                    <div className="rounded-2xl border border-blue-900/30 bg-blue-900/10 p-6">
                        <h4 className="font-bold text-blue-400 mb-2">{t("needAssistance")}</h4>
                        <p className="text-sm text-blue-300/70 mb-4">{t("aiHelperDesc")}</p>
                        <Link
                            href="/dashboard/inbox"
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
                        >
                            {t("openComms")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
