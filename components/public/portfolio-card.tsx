"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Maximize2, Sparkles } from "lucide-react";

interface PortfolioCardProps {
    title: string;
    slug: string;
    html: string;
    category?: string;
    description?: string;
    externalUrl?: string;
    imageUrl?: string;
}

// Style CSS untuk menyembunyikan scrollbar di preview iframe
const PREVIEW_HIDE_SCROLLBAR = `<style>body { scrollbar-width: none; -ms-overflow-style: none; } body::-webkit-scrollbar { display: none; }</style>`;

/**
 * Membangun srcDoc untuk iframe preview.
 * Jika konten sudah merupakan dokumen HTML lengkap (memiliki <html> atau <!DOCTYPE>),
 * sisipkan style scrollbar-hiding ke dalam <head> yang sudah ada agar
 * external resources (CDN stylesheet, script) tetap bisa dimuat.
 * Jika konten hanya fragment HTML, bungkus dalam dokumen HTML baru.
 */
function buildSrcDoc(content: string): string {
    if (!content) return "<html><body style='background: #f8fafc'></body></html>";

    const trimmed = content.trim();
    const isFullDocument = /^<!doctype\s+html|^<html[\s>]/i.test(trimmed);

    if (isFullDocument) {
        if (/<head[\s>]/i.test(trimmed)) {
            return trimmed.replace(/<head([^>]*)>/i, `<head$1>${PREVIEW_HIDE_SCROLLBAR}`);
        }
        return trimmed.replace(/<html([^>]*)>/i, `<html$1><head>${PREVIEW_HIDE_SCROLLBAR}</head>`);
    }

    return `<html><head>${PREVIEW_HIDE_SCROLLBAR}</head><body>${content}</body></html>`;
}

export function PortfolioCard({ title, slug, html, externalUrl, imageUrl, description, category }: PortfolioCardProps) {
    const previewUrl = `/view-design/${slug}`;
    
    return (
        <div className="group relative bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden hover:border-brand-yellow/30 transition-all duration-700 shadow-2xl hover:shadow-brand-yellow/5 backdrop-blur-sm">
            {/* Main Visual Area */}
            <div className="p-3">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-zinc-900 relative group/preview shadow-2xl">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover/preview:scale-110 opacity-80 group-hover:opacity-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 origin-top-left w-[400%] h-[400%] scale-[0.25] pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                            <iframe
                                src={externalUrl && !html ? externalUrl : undefined}
                                srcDoc={html ? buildSrcDoc(html) : undefined}
                                className="w-full h-full border-none overflow-hidden"
                                title={title}
                                scrolling="no"
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                            />
                        </div>
                    )}
                    
                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

                    {/* Floating Expand Button */}
                    <Link
                        href={previewUrl}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white/50 hover:text-brand-yellow hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 border border-white/10"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Link>

                    {/* Live Indicator Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                        </span>
                        <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest font-mono">
                            {externalUrl ? "Live Site" : "Live Render"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pb-6 pt-2">
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2">
                        {category && (
                             <span className="text-[10px] text-brand-yellow/60 font-bold uppercase tracking-[0.2em]">
                                {category}
                             </span>
                        )}
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-yellow transition-colors duration-500">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-xs text-zinc-500 line-clamp-1 font-light leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-brand-yellow" />
                        </div>
                    </div>
                    
                    <Link
                        href={previewUrl}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-brand-yellow text-white hover:text-black rounded-full text-[11px] font-black transition-all duration-500 border border-white/10 hover:border-brand-yellow shadow-lg group/btn"
                    >
                        VIEW CASE
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Background Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
}

