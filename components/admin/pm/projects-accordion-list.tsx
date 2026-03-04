"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Settings2, Loader2, ChevronDown, Calendar, User, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { type ExtendedProject } from "@/lib/shared/types";

// ============================================
// Status Configuration Map
// ============================================

/** Maps raw DB status values to human-readable labels and styling */
const STATUS_MAP: Record<string, { label: string; color: string; variant: "default" | "secondary" | "outline" }> = {
    'queue': { label: 'Queue', color: 'text-zinc-400 border-zinc-700', variant: 'outline' },
    'dev': { label: 'In Development', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', variant: 'secondary' },
    'review': { label: 'In Review', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', variant: 'outline' },
    'done': { label: 'Done', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', variant: 'default' },
};

const DEFAULT_STATUS = { label: 'Unknown', color: 'text-zinc-400 border-zinc-700', variant: 'outline' as const };

// ============================================
// Helper: Copy to Clipboard
// ============================================

/** Copies text to clipboard with toast notification */
function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
}

// ============================================
// Sub-components
// ============================================

/** Single accordion item for a project */
function ProjectAccordionItem({ project }: { project: ExtendedProject }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const status = (project.status || "queue").toLowerCase();
    const config = STATUS_MAP[status] || DEFAULT_STATUS;
    const date = new Date(project.createdAt);

    return (
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/80 bg-zinc-950/50">
            {/* Trigger / Header — always visible */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-900/40 group"
            >
                {/* Status indicator dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${status === 'done' ? 'bg-emerald-500' :
                    status === 'dev' ? 'bg-blue-500' :
                        status === 'review' ? 'bg-purple-400' :
                            'bg-zinc-600'
                    }`} />

                {/* Project title + client name */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm truncate">{project.title}</span>
                        {project.service ? (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-normal py-0 px-1.5 h-4 text-[9px] shrink-0">
                                Product
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-normal py-0 px-1.5 h-4 text-[9px] shrink-0">
                                Service
                            </Badge>
                        )}
                    </div>
                    <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
                        {project.clientName || "Unnamed Client"}
                    </span>
                </div>

                {/* Meta: Status badge + Date */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={config.variant} className={`py-0 px-2 h-5 text-[10px] ${config.color}`}>
                        {config.label}
                    </Badge>
                    <span className="text-zinc-600 text-[11px] whitespace-nowrap">
                        {date.toLocaleDateString()}
                    </span>
                </div>

                {/* Chevron */}
                <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Content — detail saat dibuka */}
            {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-zinc-800/40 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Description */}
                    {project.description && (
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3 max-w-2xl">
                            {project.description}
                        </p>
                    )}

                    {/* Detail grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        {/* Client ID */}
                        <DetailItem
                            icon={<User className="w-3.5 h-3.5" />}
                            label="Client ID"
                            value={project.userId}
                            copyable
                        />

                        {/* Invoice ID */}
                        <DetailItem
                            icon={<FileText className="w-3.5 h-3.5" />}
                            label="Invoice ID"
                            value={project.invoiceId || undefined}
                            placeholder="No Invoice"
                            copyable
                        />

                        {/* Created date */}
                        <DetailItem
                            icon={<Calendar className="w-3.5 h-3.5" />}
                            label="Created"
                            value={date.toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                    </div>

                    {/* Action button */}
                    <div className="flex justify-end pt-1">
                        <Button variant="outline" size="sm" asChild className="h-8 px-4 text-xs border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-400 gap-2">
                            <Link href={`/admin/pm/${project.id}`}>
                                <Settings2 className="w-3.5 h-3.5" />
                                Manage Project
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Reusable detail item with optional copy */
function DetailItem({
    icon,
    label,
    value,
    placeholder,
    copyable,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    placeholder?: string;
    copyable?: boolean;
}) {
    const display = value || placeholder;
    const isEmpty = !value;

    return (
        <div className="flex items-center gap-2 group/detail">
            <span className="text-zinc-600">{icon}</span>
            <div className="flex-1 min-w-0">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">{label}</span>
                <span className={`text-xs font-mono truncate block ${isEmpty ? 'text-zinc-600 italic' : 'text-zinc-400'}`} title={value}>
                    {display}
                </span>
            </div>
            {copyable && value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover/detail:opacity-100 transition-opacity bg-zinc-800/50 hover:bg-zinc-800 hover:text-white text-zinc-500 shrink-0"
                    onClick={() => copyToClipboard(value, label)}
                >
                    <Copy className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}

// ============================================
// Main Component
// ============================================

interface ProjectAccordionListProps {
    data: ExtendedProject[];
    totalCount: number;
    query?: string;
    status?: string;
}

/**
 * Accordion-based project list for the Mission Board.
 * Replaces the old DataTable with a collapsible list view.
 */
export function ProjectAccordionList({
    data: initialData,
    totalCount,
    query,
    status,
}: ProjectAccordionListProps) {
    const [data, setData] = React.useState<ExtendedProject[]>(initialData);
    const [page, setPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);

    // Sync with initial data when server props change (filters, etc.)
    React.useEffect(() => {
        setData(initialData);
        setPage(1);
    }, [initialData]);

    const hasMore = data.length < totalCount;

    /** Load next page of projects via API */
    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const nextPage = page + 1;
            const params = new URLSearchParams({ page: nextPage.toString(), limit: "10" });
            if (query) params.append("query", query);
            if (status) params.append("status", status);

            const res = await fetch(`/api/projects?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch projects");
            const newData = await res.json() as ExtendedProject[];
            setData(prev => [...prev, ...newData]);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to load more projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-2">
            {data.length > 0 ? (
                data.map((project) => (
                    <ProjectAccordionItem key={project.id} project={project} />
                ))
            ) : (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                    No projects found.
                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="h-10 px-8 rounded-full border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </div>
    );
}
