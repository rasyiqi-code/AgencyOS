"use client";

import Link from "next/link";
import { ArrowRight, Clock, Github, Rocket } from "lucide-react";
import type { ExtendedProject } from "@/lib/types";
import { useTranslations } from "next-intl";

export function MissionCard({ project }: { project: ExtendedProject }) {
    const isDev = project.status === 'dev';
    const isDone = project.status === 'done';
    const t = useTranslations("Missions");
    const tc = useTranslations("Common");

    return (
        <Link href={`/dashboard/missions/${project.id}`} className="group block relative">
            <div className={`
                relative overflow-hidden rounded-2xl border p-6 h-full transition-all duration-300
                ${isDev
                    ? 'bg-gradient-to-br from-blue-900/20 to-zinc-900/50 border-blue-500/30 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-900/20'
                    : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                }
            `}>
                {/* Background Glow for active projects */}
                {isDev && (
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700" />
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center border
                        ${isDev ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-zinc-800/50 border-white/5 text-zinc-400'}
                    `}>
                        {isDev ? <Rocket className="w-5 h-5" /> : <Github className="w-5 h-5" />}
                    </div>

                    <span className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${isDev ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}
                    `}>
                        {isDev ? t('inOrbit') : project.status.toUpperCase()}
                    </span>
                </div>

                <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                        {project.description}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-4 relative z-10">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{tc("updated")} {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-zinc-400 group-hover:text-white">
                        {t('missionControl')} <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
