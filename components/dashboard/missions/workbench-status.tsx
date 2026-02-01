"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ExternalLink, Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WorkbenchStatusProps {
    projectId: string;
    deployUrl?: string | null;
}

export function WorkbenchStatus({ projectId, deployUrl }: WorkbenchStatusProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [url, setUrl] = useState(deployUrl || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Basic validation
            let finalUrl = url.trim();
            if (finalUrl && !finalUrl.startsWith('http')) {
                finalUrl = `https://${finalUrl}`;
            }

            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ deployUrl: finalUrl }),
            });

            if (res.ok) {
                toast.success("Live URL updated");
                setIsEditing(false);
                setUrl(finalUrl); // Update local state with formatted URL
                router.refresh();
            } else {
                toast.error("Failed to update URL");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const hasUrl = !!deployUrl && deployUrl.length > 0;

    return (
        <div className="space-y-4">
            {/* Domain Section */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Live Domain</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                        <div className={`w-1 h-1 rounded-full ${hasUrl ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-500'}`} />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                            {hasUrl ? 'LIVE' : 'NOT SET'}
                        </span>
                    </div>
                </div>

                {isEditing ? (
                    <div className="p-2 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-2">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-emerald-400" />
                        </div>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="h-8 text-xs bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                            autoFocus
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                                setIsEditing(false);
                                setUrl(deployUrl || "");
                            }}
                            disabled={isLoading}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-zinc-200 truncate max-w-[150px] md:max-w-[200px]">
                                    {deployUrl ? (
                                        <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {deployUrl.replace(/^https?:\/\//, '')}
                                        </a>
                                    ) : (
                                        <span className="text-zinc-500 italic">No URL configured</span>
                                    )}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {deployUrl ? "Production Edge" : "Manual Configuration"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {deployUrl && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(true)}
                                className="h-8 w-8 text-zinc-500 hover:text-brand-yellow hover:bg-brand-yellow/10 rounded-lg"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
