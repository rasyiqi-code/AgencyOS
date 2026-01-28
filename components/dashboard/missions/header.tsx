import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Globe } from "lucide-react";
import Link from "next/link";
import type { ExtendedProject } from "@/lib/types";

interface ProjectHeaderProps {
    project: ExtendedProject;
    children?: React.ReactNode;
}

export function ProjectHeader({ project, children }: ProjectHeaderProps) {
    const isDev = project.status === 'dev';

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-zinc-900 text-zinc-500 border-zinc-800 font-mono text-[9px] px-1.5 py-0 rounded-sm">
                            ID: {project.id.slice(-12)}
                        </Badge>
                        <Badge variant={
                            project.status === 'done' ? 'default' :
                                project.status === 'dev' ? 'secondary' :
                                    'outline'
                        } className={`uppercase text-[9px] tracking-wider px-1.5 py-0 rounded-sm ${project.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                            project.status === 'dev' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' :
                                'text-zinc-500 border-zinc-800'
                            }`}>
                            {project.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {project.title}
                        </h1>
                        {isDev && <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {project.repoUrl && (
                        <Link href={project.repoUrl} target="_blank">
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-zinc-900 border-white/10 text-zinc-400 hover:text-white">
                                <Github className="w-3 h-3" />
                            </Button>
                        </Link>
                    )}
                    {project.deployUrl && (
                        <Link href={project.deployUrl} target="_blank">
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-zinc-900 border-white/10 text-zinc-400 hover:text-white">
                                <Globe className="w-3 h-3" />
                            </Button>
                        </Link>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
