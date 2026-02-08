import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Code2, Clock, TerminalSquare, ArrowRight, MessageSquare, CalendarClock } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { DailyLog } from "@/lib/shared/types";
import { cn } from "@/lib/shared/utils";
import { CompleteMissionButton } from "@/components/squad/complete-mission-button";

const MOOD_COLORS = {
    on_track: "text-emerald-500",
    delayed: "text-amber-500",
    shipped: "text-brand-yellow"
};

const MOOD_LABELS = {
    on_track: "On Track",
    delayed: "Delayed",
    shipped: "Shipped"
};

export default async function SquadActivePage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    // Fetch active missions via MissionApplication (Multi-Developer Support)
    const applications = await prisma.missionApplication.findMany({
        where: {
            squad: { userId: user.id },
            status: 'accepted',
            mission: {
                status: { not: 'archived' } // Optional: ensure not archived
            }
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            mission: {
                include: {
                    briefs: true,
                    service: true,
                    estimate: true,
                    dailyLogs: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    feedback: {
                        where: { status: 'open' }
                    }
                }
            }
        }
    });

    const activeMissions = applications.map(app => app.mission);

    return (
        <div className="flex flex-col gap-8 pb-10 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    Active Protocol
                </h1>
                <p className="text-zinc-400 text-sm">
                    Command center for your ongoing missions.
                </p>
            </div>

            {activeMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-xl bg-zinc-900/40 text-center">
                    <Activity className="w-10 h-10 text-zinc-700 mb-4" />
                    <div>
                        <p className="text-zinc-400 font-medium mb-1">No active protocols</p>
                        <p className="text-zinc-600 text-sm">You are currently on standby.</p>
                    </div>
                    <Link href="/squad" className="mt-6 px-6 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-brand-yellow transition-colors">
                        Browse Missions
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {activeMissions.map(mission => {
                        const latestLog = mission.dailyLogs[0] as DailyLog | undefined;
                        const moodColor = latestLog ? MOOD_COLORS[latestLog.mood as keyof typeof MOOD_COLORS] : "text-zinc-500";
                        const moodLabel = latestLog ? MOOD_LABELS[latestLog.mood as keyof typeof MOOD_LABELS] : "No Updates";

                        return (
                            <div key={mission.id} className="group bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
                                <div className="flex flex-col md:flex-row">
                                    {/* Visual Column */}
                                    <div className="w-full md:w-64 bg-zinc-900/60 border-b md:border-b-0 md:border-r border-white/5 relative min-h-[160px]">
                                        {mission.service?.image ? (
                                            <SafeImage
                                                src={mission.service.image}
                                                alt={mission.title}
                                                fill
                                                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                                                <Activity className="w-10 h-10 text-zinc-800" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm border-white/10 text-white font-mono text-[10px]">
                                                {mission.id.slice(-8).toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-brand-yellow bg-brand-yellow/10 px-2 py-1 rounded border border-brand-yellow/20 w-fit">
                                                <Activity className="w-3 h-3" />
                                                ACTIVE PROTOCOL
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 p-5 flex flex-col justify-between gap-6">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white group-hover:text-brand-yellow transition-colors">
                                                    {mission.title}
                                                </h3>
                                                <Link href={`/squad/missions/${mission.id}`}>
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-white hover:text-black transition-colors border-white/10 text-zinc-500">
                                                        Open Terminal <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Badge>
                                                </Link>
                                            </div>
                                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                                                {mission.description}
                                            </p>

                                            {/* Live Stats Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {/* Latest Daily Update */}
                                                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                        <CalendarClock className="w-3 h-3" />
                                                        Latest Update
                                                    </div>
                                                    {latestLog ? (
                                                        <div>
                                                            <div className={cn("text-xs font-bold mb-1", moodColor)}>
                                                                {moodLabel} · <span className="text-zinc-500 font-normal">{new Date(latestLog.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-zinc-400 line-clamp-1 italic">&quot;{latestLog.content}&quot;</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-zinc-600 italic">No updates logged yet.</p>
                                                    )}
                                                </div>

                                                {/* Open Issues */}
                                                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                        <MessageSquare className="w-3 h-3" />
                                                        Communications
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={cn("text-xl font-mono font-bold", mission.feedback.length > 0 ? "text-white" : "text-zinc-600")}>
                                                            {mission.feedback.length}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">Open Issues</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Started {new Date(mission.updatedAt).toLocaleDateString()}
                                                </span>
                                                {mission.repoUrl && (
                                                    <span className="flex items-center gap-1.5 text-emerald-500/80">
                                                        <Code2 className="w-3.5 h-3.5" />
                                                        Repo Connected
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1" />

                                            {/* Quick Links */}
                                            <div className="flex gap-2">
                                                <CompleteMissionButton missionId={mission.id} />
                                                {mission.repoUrl && (
                                                    <Link href={mission.repoUrl} target="_blank">
                                                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded border border-white/5 transition-colors flex items-center gap-1.5">
                                                            <Code2 className="w-3.5 h-3.5" /> Workbench
                                                        </button>
                                                    </Link>
                                                )}
                                                <Link href={`/squad/missions/${mission.id}`}>
                                                    <button className="px-3 py-1.5 bg-white text-black hover:bg-brand-yellow text-xs font-bold rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-white/5">
                                                        <TerminalSquare className="w-3.5 h-3.5" /> Mission Terminal
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
