import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { OverviewHeader } from "@/components/dashboard/overview-header";
import { MissionCard } from "@/components/dashboard/mission-card";
import { FinanceWidget } from "@/components/dashboard/finance-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
    const user = await stackServerApp.getUser();

    const projects = await prisma.project.findMany({
        where: {
            userId: user?.id,
            status: { not: 'payment_pending' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            briefs: true,
            feedback: true,
            estimate: {
                include: { service: true }
            }
        }
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
                                <h2 className="text-xl font-bold text-white tracking-tight">Active Mission</h2>
                                <span className="text-xs font-mono text-blue-400 animate-pulse">● LIVE UPDATE</span>
                            </div>
                            <MissionCard project={activeProject} />
                        </div>
                    )}

                    {/* Recent Missions Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">Recent Missions</h2>
                        </div>

                        {projects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
                                <p className="text-zinc-500">No missions initialized yet.</p>
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

                {/* Sidebar Column: Widgets */}
                <div className="space-y-6">
                    <FinanceWidget />

                    <div>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
                        <QuickActions />
                    </div>

                    {/* Support Widget placeholder could go here */}
                    <div className="rounded-2xl border border-blue-900/30 bg-blue-900/10 p-6">
                        <h4 className="font-bold text-blue-400 mb-2">Need Assistance?</h4>
                        <p className="text-sm text-blue-300/70 mb-4">Our AI Systems Engineer is online and ready to help you scope your next mission.</p>
                        <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg w-full transition-colors cursor-pointer">
                            Open Comms Channel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
