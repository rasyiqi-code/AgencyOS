import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, Wallet, Shield } from "lucide-react";

export default async function SquadProfilePage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }


    const completedMissions = await prisma.project.count({
        where: {
            developerId: user.id,
            status: 'done'
        }
    });

    // Calculate Rank
    let rank = "SCOUT";
    if (completedMissions >= 5) rank = "VANGUARD";
    if (completedMissions >= 20) rank = "ELITE";
    if (completedMissions >= 50) rank = "LEGEND";

    const squadProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id }
    });

    if (!squadProfile) {
        redirect("/squad/onboarding");
    }

    return (
        <div className="flex flex-col gap-8 pb-10 w-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        Operative Profile
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        {squadProfile.name} <span className="text-zinc-600">({user.primaryEmail})</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow/20 border border-brand-yellow/20 rounded-full">
                        RANK: {rank}
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Total Earnings</span>
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <Wallet className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            ${(squadProfile.totalEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1 font-medium">
                            Lifetime earnings
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <div className="text-sm text-zinc-400">Reputation Score</div>
                        <div className="text-2xl font-bold text-white">{squadProfile.reputation || 100}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Reliability Score</div>
                    </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Missions Completed</span>
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <Shield className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{completedMissions}</div>
                        <div className="text-xs text-zinc-500 mt-1">Lifetime total</div>
                    </div>
                </div>
            </div>

            {/* Active Missions Link Hint */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-white font-bold mb-1">Check Active Assignments</h3>
                    <p className="text-zinc-500 text-xs">View your current protocols and mission directives.</p>
                </div>
                <Link href="/squad/active">
                    <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-brand-yellow transition-colors">
                        Go to Active Protocol
                    </button>
                </Link>
            </div>
        </div>
    );
}
