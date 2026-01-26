import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, TerminalSquare, AlertTriangle, CheckSquare } from "lucide-react";
import { revalidatePath } from "next/cache";

interface PageProps {
    params: Promise<{ id: string }>;
}

import { stackServerApp } from "@/lib/stack";

async function acceptMission(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const user = await stackServerApp.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    await prisma.project.update({
        where: { id },
        data: {
            status: 'dev',
            developerId: user.id
        }
    });
    revalidatePath('/squad');
    redirect('/squad');
}

export default async function MissionDetailPage({ params }: PageProps) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: { briefs: true }
    });

    if (!project) notFound();

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-4xl mx-auto w-full">
            {/* Nav */}
            <Link href="/squad" className="flex items-center gap-2 text-green-700 hover:text-green-500 transition-colors text-sm font-bold">
                <ChevronLeft className="w-4 h-4" /> BACK_TO_BOARD
            </Link>

            {/* Header */}
            <div className="border-b border-green-500/20 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="rounded-none border-green-500/30 text-green-500 font-mono text-sm px-3 py-1">
                        MISSION_ID: {project.id.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-green-800 font-bold bg-green-900/10 px-2 py-1">
                        CLEARANCE: LEVEL 1
                    </span>
                </div>
                <h1 className="text-4xl font-bold text-green-400 mb-4">{project.title}</h1>
                <p className="text-green-600 font-mono text-lg leading-relaxed">
                    {project.description}
                </p>
            </div>

            {/* Briefs / Intel */}
            <div className="grid gap-8">
                <div className="bg-black border border-green-500/20 p-6 relative">
                    <div className="absolute top-0 left-0 bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400 font-mono">
                        INTEL_DUMP
                    </div>
                    {project.briefs.length > 0 ? (
                        <div className="space-y-6 mt-4">
                            {project.briefs.map((brief, i) => (
                                <div key={brief.id} className="font-mono text-sm text-green-600/80 leading-7 whitespace-pre-wrap border-l-2 border-green-900 pl-4">
                                    <span className="text-green-800 font-bold block mb-2">SEGMENT_0{i + 1}</span>
                                    {brief.content}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-green-800 font-mono">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            INTEL_CORRUPTED_OR_MISSING
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="bg-green-500/5 border border-green-500/20 p-8 flex flex-col items-center justify-center text-center gap-4">
                    <TerminalSquare className="w-12 h-12 text-green-500 animate-pulse" />
                    <div>
                        <h3 className="text-xl font-bold text-green-400">MISSION_PARAMETERS_CONFIRMED?</h3>
                        <p className="text-green-700 text-sm mt-1 max-w-md">
                            By accepting this mission, you commit to the execution within the specified timeline. Failure is not an option.
                        </p>
                    </div>

                    <form action={acceptMission}>
                        <input type="hidden" name="id" value={project.id} />
                        <button type="submit" className="bg-green-600 text-black px-8 py-3 font-bold font-mono text-lg hover:bg-green-500 hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <CheckSquare className="w-5 h-5" /> ACCEPT_MISSION
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
