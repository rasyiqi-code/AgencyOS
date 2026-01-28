import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { MissionCard } from "@/components/dashboard/missions/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link"; // Added Link import

export default async function MissionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const user = await stackServerApp.getUser();
    const { q } = await searchParams; // Await searchParams

    const projects = await prisma.project.findMany({
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
            estimate: {
                include: { service: true }
            },
            briefs: true,
            dailyLogs: true,
            feedback: true
        }
    });

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Mission Log</h1>
                    <p className="text-zinc-400 mt-1">All active and archived operations.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <form className="relative w-full md:w-64">
                        {/* Simple server-side search form */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            name="q"
                            placeholder="Search missions..."
                            className="bg-zinc-900/50 border-white/10 pl-9 w-full"
                            defaultValue={q}
                        />
                    </form>
                    <Link href="/price-calculator">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-semibold cursor-pointer">
                            + New Mission
                        </Button>
                    </Link>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-900/20">
                    <p className="text-zinc-500">No missions found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <MissionCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}
