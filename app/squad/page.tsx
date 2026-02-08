import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code } from "lucide-react";
import Link from "next/link";
import { InvitationCard } from "@/components/squad/invitation-card";

import { redirect } from "next/navigation";

export default async function MissionBoardPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const squadProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id },
        include: {
            applications: {
                where: { status: { in: ['accepted', 'invited'] } },
                include: { mission: { include: { estimate: true } } }
            }
        }
    });

    if (!squadProfile) {
        redirect("/squad/onboarding");
    }



    // Fetch available missions (status: queue)
    const missions = await prisma.project.findMany({
        where: { status: 'queue' },
        orderBy: { createdAt: 'desc' },
        include: { estimate: true }
    });

    // Separate Invited vs Active
    const invitedMissions = squadProfile.applications.filter(app => app.status === 'invited');
    const activeMissions = squadProfile.applications.filter(app => app.status === 'accepted');

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Mission Control
                </h1>
                <p className="text-zinc-400 max-w-2xl">
                    Manage your assignments and pending directives.
                </p>
            </div>

            {/* Invitations Section */}
            {invitedMissions.length > 0 && (
                <div className="mb-8 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <h2 className="text-sm font-semibold text-white">Pending Invitations</h2>
                    </div>
                    <div className="grid gap-3">
                        {invitedMissions.map((app) => (
                            <InvitationCard
                                key={app.id}
                                applicationId={app.id}
                                missionTitle={app.mission.title}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Active Assignments */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Active Tasks</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeMissions.length === 0 && invitedMissions.length === 0 && missions.length === 0 ? (
                        <div className="col-span-full py-12 text-center rounded-xl border border-white/5 bg-zinc-900/40 border-dashed">
                            <Code className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-sm font-medium text-white mb-1">No Active Tasks</h3>
                            <p className="text-xs text-zinc-500">Pick a task from the Available Tasks below.</p>
                        </div>
                    ) : (
                        activeMissions.map((app) => {
                            const mission = app.mission;
                            return (
                                <Link key={mission.id} href={`/squad/missions/${mission.id}`} className="group block">
                                    <div className="h-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5 hover:bg-zinc-900 hover:border-brand-yellow/30 hover:shadow-lg transition-all flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Active</Badge>
                                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-yellow transition-colors" />
                                        </div>
                                        <h3 className="font-semibold text-white mb-1 group-hover:text-brand-yellow transition-colors">{mission.title}</h3>
                                        <p className="text-xs text-zinc-500 line-clamp-2">{mission.description}</p>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Available Tasks (Queue) */}
            <div className="space-y-4 pt-8 border-t border-white/5">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Available Tasks</h2>

                {missions.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-zinc-500 text-sm">No new tasks available in queue.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {missions.map((mission) => (
                            <div key={mission.id} className="group relative overflow-hidden bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 transition-all hover:bg-zinc-900 hover:border-brand-yellow/30 hover:shadow-lg hover:shadow-brand-yellow/5">
                                <div className="mb-4 flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-lg text-xs font-medium">
                                        ID: {mission.id.slice(-4).toUpperCase()}
                                    </Badge>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-yellow transition-colors">
                                    {mission.title}
                                </h3>
                                <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
                                    {mission.description || "No intel available."}
                                </p>

                                {/* Tech Stack Simulation */}
                                <div className="flex gap-2 mb-6">
                                    {mission.estimate?.totalHours && (
                                        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full">
                                            <span className="text-xs text-zinc-400 font-mono">
                                                {mission.estimate.totalHours}h
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Link href={`/squad/missions/${mission.id}`} className="block mt-auto">
                                    <button className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-yellow transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
