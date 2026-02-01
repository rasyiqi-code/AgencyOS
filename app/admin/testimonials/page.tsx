"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    MessageSquare,
    Calendar,
    User,
    Search,
    Filter,
    Loader2,
    Trash2
} from "lucide-react";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar?: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/testimonials", { cache: "no-store" });
            const result = await res.json();
            if (result.success && result.data) {
                setTestimonials(result.data);
            }
        } catch {
            toast.error("Failed to load testimonials");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadData();
        };
        init();
    }, [loadData]);

    async function toggleStatus(id: string, currentStatus: boolean) {
        startTransition(async () => {
            try {
                const res = await fetch("/api/testimonials", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, isActive: !currentStatus }),
                });
                const result = await res.json();

                if (result.success) {
                    toast.success(`Testimonial ${!currentStatus ? 'approved' : 'hidden'}`);
                    loadData();
                } else {
                    toast.error("Failed to update status");
                }
            } catch {
                toast.error("Failed to update status");
            }
        });
    }

    async function remove(id: string) {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;

        startTransition(async () => {
            try {
                const res = await fetch(`/api/testimonials?id=${id}`, {
                    method: "DELETE",
                });
                const result = await res.json();

                if (result.success) {
                    toast.success("Testimonial deleted");
                    loadData();
                } else {
                    toast.error("Failed to delete");
                }
            } catch {
                toast.error("Failed to delete");
            }
        });
    }

    return (
        <div className="p-8 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-bold uppercase tracking-wider">
                        <MessageSquare className="w-3 h-3" />
                        Feedback Management
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        Testimonials
                    </h1>
                    <p className="text-zinc-500 max-w-md">
                        Review and manage client feedback before it goes live on the platform.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-10">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-10">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-8">User</TableHead>
                            <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Feedback Content</TableHead>
                            <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                            <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Submission Date</TableHead>
                            <TableHead className="text-right text-zinc-500 font-bold uppercase text-[10px] tracking-widest pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
                                        <p className="text-sm text-zinc-500 font-medium">Syncing testimonials...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : testimonials.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                                        <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
                                            <MessageSquare className="w-8 h-8 text-zinc-700" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-400 font-bold">Inbox is Clear</p>
                                            <p className="text-zinc-600 text-sm">No new testimonials to review right now.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            testimonials.map((t) => (
                                <TableRow key={t.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border border-white/10 ring-4 ring-white/5 ring-offset-0">
                                                <AvatarImage src={t.avatar || ""} />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                                    <User className="w-5 h-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="font-bold text-white text-sm">{t.name}</div>
                                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{t.role}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <div className="text-sm text-zinc-400 leading-relaxed line-clamp-2 italic">
                                            &quot;{t.content}&quot;
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-yellow-500"}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.isActive ? "text-green-500" : "text-yellow-500"}`}>
                                                {t.isActive ? "Live" : "Awaiting Review"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                                            <Calendar className="w-3 h-3 opacity-50" />
                                            {new Date(t.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={`h-9 px-4 rounded-xl font-bold text-xs transition-all ${t.isActive
                                                    ? "text-zinc-500 hover:text-white hover:bg-white/5"
                                                    : "bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-black border border-brand-yellow/20"
                                                    }`}
                                                onClick={() => toggleStatus(t.id, t.isActive)}
                                                disabled={isPending}
                                            >
                                                {t.isActive ? "Hide" : "Approve"}
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-9 w-9 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                onClick={() => remove(t.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Glass Glow Effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-yellow/10 blur-[100px] pointer-events-none opacity-50" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-yellow/5 blur-[100px] pointer-events-none opacity-50" />
            </div>

            {/* Pagination Placeholder */}
            {testimonials.length > 0 && (
                <div className="flex items-center justify-between px-4">
                    <p className="text-xs text-zinc-600">Showing <span className="text-zinc-400 font-bold">{testimonials.length}</span> entries</p>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" disabled className="text-zinc-600 h-8 rounded-lg text-xs">Prev</Button>
                        <Button variant="ghost" size="sm" disabled className="text-zinc-400 h-8 rounded-lg text-xs bg-white/5">1</Button>
                        <Button variant="ghost" size="sm" disabled className="text-zinc-600 h-8 rounded-lg text-xs">Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

