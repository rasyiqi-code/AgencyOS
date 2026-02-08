import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Activity } from "lucide-react";

export default async function SquadProfilePage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }


    const completedTasks = await prisma.project.count({
        where: {
            developerId: user.id,
            status: 'done'
        }
    });

    const activeTasks = await prisma.project.count({
        where: {
            developerId: user.id,
            status: 'dev'
        }
    });

    // Calculate Rank
    let rank = "SCOUT";
    if (completedTasks >= 5) rank = "VANGUARD";
    if (completedTasks >= 20) rank = "ELITE";
    if (completedTasks >= 50) rank = "LEGEND";

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
                <div className="flex items-center gap-3">
                    <Link href="/squad/profile/edit">
                        <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-zinc-700">
                            Edit Profile
                        </button>
                    </Link>
                    <Badge variant="secondary" className="px-3 py-1.5 bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow/20 border border-brand-yellow/20 rounded-full">
                        RANK: {rank}
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Active Tasks</span>
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <Activity className="w-4 h-4 text-brand-yellow" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {activeTasks}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1 font-medium">
                            Current load
                        </div>
                    </div>
                </div>



                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Tasks Completed</span>
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <Shield className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{completedTasks}</div>
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
