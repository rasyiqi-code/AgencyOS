"use client";

import Link from "next/link";
import { ExternalLink, Maximize2 } from "lucide-react";
import { useRef, useState } from "react";

interface PortfolioCardProps {
    title: string;
    slug: string;
    html: string;
    category?: string; // Metadata, kept for potential use or interface compatibility
}

export function PortfolioCard({ title, slug, html }: PortfolioCardProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeHeight, setIframeHeight] = useState<number | string>(800);

    const handleLoad = () => {
        const updateHeight = () => {
            if (iframeRef.current?.contentWindow) {
                try {
                    const doc = iframeRef.current.contentWindow.document;
                    // Using getBoundingClientRect on documentElement is often more accurate for scaled content
                    const height = doc.documentElement.getBoundingClientRect().height || doc.body.scrollHeight;
                    setIframeHeight(height);
                } catch (e) {
                    console.warn("Could not calculate iframe height", e);
                }
            }
        };

        updateHeight();
        // Handle Tailwind CDN and image layout shifts
        setTimeout(updateHeight, 500);
        setTimeout(updateHeight, 2000);
        setTimeout(updateHeight, 5000); // Final check for slow CDN
    };

    return (
        <div className="group relative bg-[#090909] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col aspect-[4/5] shadow-2xl">
            {/* Header / Meta */}
            <div className="p-4 pb-2 flex items-start justify-between shrink-0">
                <div className="space-y-2">
                    <div className="w-8 h-1 rounded-full bg-white/10 group-hover:bg-primary/40 transition-colors" />
                    <h3 className="text-base font-extrabold text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>
                <Link
                    href={`/view-design/${slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                    title="View Fullscreen"
                >
                    <Maximize2 className="w-4 h-4" />
                </Link>
            </div>

            {/* Preview Area (Window Style with Scroll) */}
            <div className="flex-1 relative bg-white overflow-y-auto overflow-x-hidden mx-4 mb-4 rounded-lg shadow-lg border border-white/5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300/50 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400/80 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                {/* Interaction Guard - But allow scroll */}
                <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />

                <div
                    className="relative w-full overflow-hidden"
                    style={{
                        height: typeof iframeHeight === 'number' ? `${iframeHeight * 0.25}px` : '1000px',
                    }}
                >
                    <div
                        className="origin-top-left scale-[0.25] absolute top-0 left-0 w-[400%] h-[400%]"
                    >
                        <iframe
                            ref={iframeRef}
                            srcDoc={`<style>html,body{margin:0;padding:0;overflow:hidden;height:auto !important;min-height:0 !important;display:flow-root !important;width:100% !important;}</style>${html}`}
                            className="w-full h-full border-0 pointer-events-none"
                            title={title}
                            onLoad={handleLoad}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0 font-display">
                <span className="text-[10px] text-zinc-500 italic font-medium">
                    Live Rendered
                </span>
                <Link
                    href={`/view-design/${slug}`}
                    className="text-[10px] font-black text-white hover:text-primary transition-colors flex items-center gap-1.5 tracking-wider uppercase"
                >
                    PREVIEW <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
