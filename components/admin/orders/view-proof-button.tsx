"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ViewProofButtonProps {
    estimate: {
        id: string;
        proofUrl?: string | null;
        project?: { title: string } | null;
        title?: string | null;
        createdAt: string | Date;
    };
}

export function ViewProofButton({ estimate }: ViewProofButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const proofUrl = estimate.proofUrl;
    if (!proofUrl) return null;

    const isPdf = proofUrl.toLowerCase().endsWith(".pdf");

    const invoiceId = estimate.id.slice(-8).toUpperCase();
    const projectTitle = estimate.project?.title || estimate.title || "Untitled";
    const dateStr = estimate.createdAt instanceof Date
        ? estimate.createdAt.toISOString().split('T')[0]
        : new Date(estimate.createdAt).toISOString().split('T')[0];

    const fileName = `Proof-${invoiceId}-${projectTitle.replace(/[^a-z0-9]/gi, '_')}-${dateStr}${isPdf ? '.pdf' : ''}`;

    // Construct Proxy URL if it's an R2 URL (to bypass Public Access blocks)
    let displayUrl = proofUrl;
    try {
        const urlObj = new URL(proofUrl);
        if (urlObj.host.includes("r2.dev")) {
            const rawPath = decodeURIComponent(urlObj.pathname);
            const key = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
            displayUrl = `/api/storage/proxy?key=${encodeURIComponent(key)}`;
        }
    } catch {
        // invalid url, keep original
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 p-0 hover:bg-transparent">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs underline hover:no-underline">View Proof</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className={cn(
                "bg-zinc-900 border-white/10 text-white flex flex-col p-6",
                isPdf ? "max-w-[95vw] w-full h-[95vh]" : "max-w-fit w-full max-h-[95vh]"
            )}>
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex justify-between items-center">
                        <span>Payment Proof</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Verify the payment proof uploaded by the client.
                    </DialogDescription>
                </DialogHeader>
                <div className={cn(
                    "mt-4 flex items-center justify-center bg-black/50 rounded-lg p-2 overflow-hidden",
                    isPdf ? "flex-1" : ""
                )}>
                    {isPdf ? (
                        <iframe src={displayUrl} className="w-full h-full border-none" />
                    ) : (
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={displayUrl}
                                alt="Payment Proof"
                                className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md"
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-4 shrink-0">
                    <Button variant="secondary" size="sm" asChild>
                        <a href={displayUrl} download={fileName} target="_blank">
                            <Download className="w-3.5 h-3.5 mr-2" />
                            Download Original
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
