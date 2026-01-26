import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, Shield, Trophy, Activity, ArrowUpRight } from "lucide-react";

export default async function SquadProfilePage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    const activeMissions = await prisma.project.findMany({
        where: {
            developerId: user.id,
            status: 'dev'
        },
        orderBy: { updatedAt: 'desc' }
    });

    const completedMissions = await prisma.project.count({
        where: {
            developerId: user.id,
            status: 'done'
        }
    });

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-green-500/20 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter text-green-500 flex items-center gap-2">
                        <span className="text-green-800">./</span>
                        OPERATIVE_PROFILE
                    </h1>
                    <p className="text-green-700 mt-1 font-mono text-sm uppercase">
                        {user.displayName || user.primaryEmail}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-none border-green-500/30 text-green-500 font-mono text-xs px-3 py-1 bg-green-900/10">
                        RANK: VANGUARD
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-black border border-green-500/20 p-6 flex flex-col justify-between group hover:border-green-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-green-800 font-mono text-xs font-bold uppercase">Total_Earnings</span>
                        <Wallet className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400 font-mono">$12,450.00</div>
                        <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> +$2,400 this month
                        </div>
                    </div>
                </div>

                <div className="bg-black border border-green-500/20 p-6 flex flex-col justify-between group hover:border-green-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-green-800 font-mono text-xs font-bold uppercase">Reputation_Score</span>
                        <Trophy className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400 font-mono">98.4%</div>
                        <div className="text-xs text-green-700 mt-1">Top 5% of Squad</div>
                    </div>
                </div>

                <div className="bg-black border border-green-500/20 p-6 flex flex-col justify-between group hover:border-green-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-green-800 font-mono text-xs font-bold uppercase">Missions_Completed</span>
                        <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400 font-mono">{completedMissions}</div>
                        <div className="text-xs text-green-700 mt-1">Lifetime total</div>
                    </div>
                </div>
            </div>

            {/* Active Missions */}
            <div>
                <h2 className="text-xl font-bold tracking-tighter text-green-500 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5" /> ACTIVE_PROTOCOLS
                </h2>
                {activeMissions.length === 0 ? (
                    <div className="border border-dashed border-green-900/50 rounded p-8 text-center bg-green-900/5">
                        <p className="text-green-800">NO_ACTIVE_MISSIONS</p>
                        <Link href="/squad" className="text-xs text-green-600 hover:text-green-400 mt-2 underline">
                            Check Mission Board
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {activeMissions.map(mission => (
                            <div key={mission.id} className="bg-green-500/5 border border-green-500/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className="rounded-none border-green-500/30 text-green-500 font-mono text-[10px]">
                                            IN_PROGRESS
                                        </Badge>
                                        <span className="text-zinc-500 text-xs">Started {mission.updatedAt.toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-green-400">{mission.title}</h3>
                                </div>

                                <div className="flex gap-3">
                                    <Link href={`/squad/missions/${mission.id}`}>
                                        <button className="px-4 py-2 bg-black border border-green-500/30 text-green-500 text-xs font-bold hover:bg-green-500 hover:text-black transition-colors">
                                            VIEW_INTEL
                                        </button>
                                    </Link>
                                    <button disabled className="px-4 py-2 bg-green-500/10 border border-green-500/10 text-green-600 text-xs font-bold cursor-not-allowed opacity-50">
                                        SUBMIT_WORK
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
