'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export type DailyLogMood = "on_track" | "delayed" | "shipped";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarClock, CheckCircle2, AlertCircle, Ship, Send } from 'lucide-react';
import { toast } from 'sonner';

import { type DailyLog } from '@/lib/types';

interface DailyLogFeedProps {
    projectId: string;
    initialLogs: DailyLog[];
    isAdmin?: boolean;
}

const MOOD_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, label: string }> = {
    on_track: { icon: CheckCircle2, color: 'text-emerald-500', label: 'On Track' },
    delayed: { icon: AlertCircle, color: 'text-amber-500', label: 'Delayed' },
    shipped: { icon: Ship, color: 'text-blue-500', label: 'Shipped Feature' },
};

export function DailyLogFeed({ projectId, initialLogs, isAdmin = false }: DailyLogFeedProps) {
    const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<DailyLogMood>('on_track');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isPending] = useTransition();
    const router = useRouter();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);

            // Generate previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        const removedFile = newFiles.splice(index, 1);
        setFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const formData = new FormData();
        formData.append('content', content);
        formData.append('mood', mood);
        files.forEach(file => {
            formData.append('images', file);
        });

        // Optimistic UI for text content (images won't show immediately in optimistic)
        const optimisticLog: DailyLog = {
            id: 'temp-' + Date.now(),
            content,
            mood,
            createdAt: new Date(),
            images: [], // Images require upload first
            projectId // Added missing prop
        };

        setLogs([optimisticLog, ...logs]);
        setContent('');
        setFiles([]);
        setPreviews([]);

        // Cleanup previews
        previews.forEach(url => URL.revokeObjectURL(url));

        const response = await fetch(`/api/projects/${projectId}/daily-log`, {
            method: 'POST',
            body: formData, // Send FormData instead of JSON
        });

        if (!response.ok) {
            toast.error('Failed to post update');
        } else {
            toast.success('Update posted');
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-zinc-200">Daily Updates</h3>
                </div>
                <span className="text-xs text-zinc-500">{logs.length} entries</span>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {logs.map((log) => {
                        const moodConfig = MOOD_CONFIG[log.mood] || MOOD_CONFIG['on_track'];
                        const Icon = moodConfig.icon;
                        const hasImages = log.images && log.images.length > 0;

                        return (
                            <div key={log.id} className="relative pl-6 pb-2 border-l border-white/10 last:border-0 last:pb-0">
                                <div className={cn("absolute -left-1.5 top-0 w-3 h-3 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center", moodConfig.color)}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-zinc-500">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className={cn("font-medium flex items-center gap-1", moodConfig.color)}>
                                            <Icon className="w-3 h-3" />
                                            {moodConfig.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {log.content}
                                    </p>

                                    {/* Image Grid */}
                                    {hasImages && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                            {log.images!.map((img, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/40 group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img}
                                                        alt="Attachment"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <a href={img} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-transparent" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {logs.length === 0 && (
                        <div className="text-center py-10 text-zinc-600 italic text-sm">
                            No updates yet today.
                        </div>
                    )}
                </div>
            </ScrollArea>

            {isAdmin && (
                <div className="p-3 bg-zinc-950 border-t border-white/5">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Textarea
                            placeholder="What did you ship today?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[80px] bg-zinc-900 border-white/10 text-sm text-zinc-200 placeholder:text-zinc-500 focus:ring-opacity-50"
                        />

                        {/* File Previews */}
                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative w-16 h-16 rounded-md overflow-hidden border border-white/10 group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                                {/* File Input Button */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Button size="sm" type="button" variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    </Button>
                                </div>

                                <div className="w-px h-4 bg-white/10 mx-1" />

                                {(Object.keys(MOOD_CONFIG) as DailyLogMood[]).map((m) => {
                                    const isActive = mood === m;
                                    const config = MOOD_CONFIG[m];
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setMood(m)}
                                            className={cn(
                                                "p-1.5 rounded-md transition-all border border-transparent",
                                                isActive ? "bg-white/10 border-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                            title={config.label}
                                        >
                                            <Icon className={cn("w-4 h-4", isActive && config.color)} />
                                        </button>
                                    )
                                })}
                            </div>
                            <Button size="sm" type="submit" disabled={isPending || (!content.trim() && files.length === 0)} className="h-8 gap-2">
                                Post Update
                                <Send className="w-3 h-3" />
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
