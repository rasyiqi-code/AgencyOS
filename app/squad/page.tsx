import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Code, Database, Globe } from "lucide-react";

export default async function MissionBoardPage() {
    // Fetch available missions (status: queue)
    const missions = await prisma.project.findMany({
        where: { status: 'queue' },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-green-500 flex items-center gap-2">
                    <span className="text-green-800">./</span>
                    AVAILABLE_MISSIONS
                </h1>
                <p className="text-green-700 mt-1 font-mono text-sm max-w-2xl">
                    Select a protocol to engage. Authorized personnel only.
                </p>
            </div>

            {/* Mission Grid */}
            {missions.length === 0 ? (
                <div className="border border-dashed border-green-900/50 rounded p-12 text-center">
                    <p className="text-green-800">NO_ACTIVE_MISSIONS_DETECTED</p>
                    <p className="text-xs text-green-900 mt-2">Standby for new directives.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {missions.map((mission) => (
                        <div key={mission.id} className="group relative overflow-hidden bg-black border border-green-500/20 p-6 transition-all hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-green-500/30 group-hover:border-green-500/80 transition-colors" />

                            <div className="mb-4 flex items-center justify-between">
                                <Badge variant="outline" className="rounded-none border-green-500/30 text-green-500 font-mono text-xs">
                                    ID: {mission.id.slice(-4).toUpperCase()}
                                </Badge>
                                <span className="text-xs text-green-800 font-bold animate-pulse">OPEN</span>
                            </div>

                            <h3 className="text-xl font-bold text-green-400 mb-2 truncate group-hover:text-green-300 transition-colors">
                                {mission.title}
                            </h3>
                            <p className="text-sm text-green-700 line-clamp-3 mb-6 font-mono leading-relaxed">
                                {mission.description || "No intel available."}
                            </p>

                            {/* Tech Stack Simulation (Random for MVP) */}
                            <div className="flex gap-2 mb-6">
                                <div className="p-1.5 bg-green-500/5 border border-green-500/10 rounded-none">
                                    <Globe className="w-3 h-3 text-green-600" />
                                </div>
                                <div className="p-1.5 bg-green-500/5 border border-green-500/10 rounded-none">
                                    <Database className="w-3 h-3 text-green-600" />
                                </div>
                                <div className="p-1.5 bg-green-500/5 border border-green-500/10 rounded-none">
                                    <Code className="w-3 h-3 text-green-600" />
                                </div>
                            </div>

                            <Link href={`/squad/missions/${mission.id}`} className="block">
                                <button className="w-full border border-green-500/30 bg-green-500/5 text-green-500 py-2 text-xs font-bold hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2 group-hover:tracking-wider">
                                    ACCESS_INTEL <ArrowRight className="w-3 h-3" />
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
