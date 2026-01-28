"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Eye, ExternalLink, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface WorkbenchStatusProps {
    projectId: string;
    deployUrl?: string | null;
}

interface Domain {
    name: string;
    verified: boolean;
}

export function WorkbenchStatus({ projectId, deployUrl }: WorkbenchStatusProps) {
    const [status, setStatus] = useState<string | null>(null);
    const [polling, setPolling] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const retryCountRef = useRef(0);

    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/workbench-status`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.state) {
                    setStatus(data.state);
                    if (data.url) setPreviewUrl(data.url);
                    if (data.domains) setDomains(data.domains);
                    // Stop polling if status is final
                    if (['READY', 'ERROR', 'CANCELED'].includes(data.state)) {
                        setPolling(false);
                    }
                } else {
                    // No data found yet, increment retry
                    retryCountRef.current++;
                    if (retryCountRef.current > 12) { // Stop after ~1 minute (12 * 5s)
                        setPolling(false);
                        setStatus('NOT_FOUND');
                    }
                }
            } else {
                retryCountRef.current++;
                if (retryCountRef.current > 12) {
                    setPolling(false);
                    setStatus('NOT_FOUND');
                }
            }
        } catch (error) {
            console.error("Failed to check deploy status:", error);
        }
    }, [projectId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (polling) {
            interval = setInterval(checkStatus, 5000); // Poll every 5s
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [polling, checkStatus]);

    if (!deployUrl) return null;

    const mainDomain = domains.find(d => d.verified && !d.name.includes('vercel.app'))?.name
        || domains[0]?.name
        || previewUrl;

    return (
        <div className="space-y-4">
            {/* Domain Section */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Live Domain</span>
                    {status && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                            <div className={`w-1 h-1 rounded-full ${status === 'READY' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                status === 'BUILDING' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'
                                }`} />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{status}</span>
                        </div>
                    )}
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-zinc-200 truncate max-w-[150px]">
                                {mainDomain || "Fetching..."}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                Production Edge
                            </span>
                        </div>
                    </div>
                    {mainDomain && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                                <a href={`https://${mainDomain}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {status === 'READY' && previewUrl && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreviewOpen(true)}
                        className="w-full gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                    >
                        <Eye className="w-4 h-4" />
                        Preview in Workbench
                    </Button>

                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] bg-zinc-950 border-white/10 p-0 overflow-hidden flex flex-col">
                            <DialogHeader className="p-4 border-b border-white/5 shrink-0 flex flex-row items-center justify-between">
                                <DialogTitle className="text-sm font-medium text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-400" />
                                    Live Preview: {mainDomain || previewUrl}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    In-frame live preview of the current deployment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 bg-white overflow-hidden">
                                <iframe
                                    src={`https://${mainDomain || previewUrl}`}
                                    className="w-full h-full border-none"
                                    title="Deployment Preview"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}

            {polling && status !== 'READY' && (
                <div className="flex items-center justify-center gap-2 py-1">
                    <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">Syncing Vercel...</span>
                </div>
            )}
        </div>
    );
}
