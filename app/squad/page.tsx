import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Code, Database, Globe, Clock } from "lucide-react";

export default async function MissionBoardPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const squadProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id }
    });

    if (!squadProfile) {
        redirect("/squad/onboarding");
    }

    if (squadProfile.status === "pending") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verification In Progress</h1>
                <p className="text-zinc-400 max-w-md">
                    Your profile is currently under review by our command center. access to mission board is restricted until clearance is granted.
                </p>
                <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm font-mono text-zinc-500">
                    Status: <span className="text-yellow-500">PENDING_CLEARANCE</span>
                </div>
            </div>
        );
    }

    // Fetch available missions (status: queue)
    const missions = await prisma.project.findMany({
        where: { status: 'queue' },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Available Missions
                </h1>
                <p className="text-zinc-400 max-w-2xl">
                    Select a protocol to engage. Authorized personnel only.
                </p>
            </div>

            {/* Mission Grid */}
            {missions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 text-center">
                    <p className="text-zinc-500 font-medium">No missions available</p>
                    <p className="text-xs text-zinc-600 mt-2">Check back later for new directives.</p>
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
                                <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400">
                                    <Globe className="w-3.5 h-3.5" />
                                </div>
                                <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400">
                                    <Database className="w-3.5 h-3.5" />
                                </div>
                                <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400">
                                    <Code className="w-3.5 h-3.5" />
                                </div>
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
    );
}
