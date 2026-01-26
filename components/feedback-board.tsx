"use client"

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeedbackItem {
    id: string;
    content: string;
    type: string;
    status: string;
    createdAt: Date;
}

interface FeedbackBoardProps {
    projectId: string;
    feedbacks: FeedbackItem[];
}

export function FeedbackBoard({ projectId, feedbacks }: FeedbackBoardProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            await fetch('/api/feedback', {
                method: 'POST',
                body: JSON.stringify({ projectId, content }),
                headers: { 'Content-Type': 'application/json' }
            });
            setContent("");
            router.refresh();
        });
    };

    const handleToggle = async (id: string, status: string) => {
        startTransition(async () => {
            await fetch('/api/feedback', {
                method: 'PATCH',
                body: JSON.stringify({ id, status, projectId }),
                headers: { 'Content-Type': 'application/json' }
            });
            router.refresh();
        });
    }

    const openFeedbacks = feedbacks.filter(f => f.status === 'open');
    const resolvedFeedbacks = feedbacks.filter(f => f.status === 'resolved');

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Minimal Form */}
            <form onSubmit={handleSubmit} className="relative group">
                <Textarea
                    placeholder="Describe an issue or request..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[60px] text-xs resize-none bg-black/20 border-white/5 focus:border-blue-500/50 rounded-lg pr-12 transition-all"
                    disabled={isPending}
                />
                <Button
                    size="icon"
                    type="submit"
                    disabled={isPending || !content.trim()}
                    className="absolute right-2 bottom-2 h-7 w-7 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                >
                    <Send className="w-3 h-3" />
                </Button>
            </form>

            {/* Lists */}
            <div className="flex-1 space-y-4">
                {/* Open Issues */}
                {openFeedbacks.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Open Issues ({openFeedbacks.length})
                            </h3>
                        </div>
                        {openFeedbacks.map(f => (
                            <div key={f.id} className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg text-xs flex gap-3 group transition-colors">
                                <button
                                    className="h-4 w-4 shrink-0 text-red-500/50 hover:text-green-500 transition-colors mt-0.5"
                                    onClick={() => handleToggle(f.id, f.status)}
                                >
                                    <Circle className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1">
                                    <p className="text-zinc-300">{f.content}</p>
                                    <span className="text-[10px] text-zinc-600 mt-1 block">
                                        {new Date(f.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Resolved Issues */}
                {resolvedFeedbacks.length > 0 && (
                    <div className="space-y-2 pt-2">
                        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">
                            Resolved
                        </h3>
                        {resolvedFeedbacks.map(f => (
                            <div key={f.id} className="p-2 pl-3 bg-zinc-900/20 border border-white/5 rounded-lg text-xs flex gap-3 opacity-50 hover:opacity-100 transition-opacity">
                                <button
                                    className="h-4 w-4 shrink-0 text-emerald-500 hover:text-red-500 transition-colors mt-0.5"
                                    onClick={() => handleToggle(f.id, f.status)}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1">
                                    <p className="text-zinc-500 line-through decoration-zinc-700">{f.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {feedbacks.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                        </div>
                        <p className="text-xs text-zinc-500">All systems operational.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
