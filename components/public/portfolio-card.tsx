"use client";

import Link from "next/link";
import { ExternalLink, Maximize2, Sparkles } from "lucide-react";

interface PortfolioCardProps {
    title: string;
    slug: string;
    html: string;
    category?: string;
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

export function PortfolioCard({ title, slug, html }: PortfolioCardProps) {
    return (
        <div className="group bg-white border border-zinc-200 rounded-3xl flex flex-col overflow-hidden hover:border-brand-yellow/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-brand-yellow/5 relative">
            {/* Card Header - Gold */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10" style={{ backgroundColor: '#a67c00' }}>
                <h4 className="font-bold text-white text-base tracking-tight truncate pr-4">
                    {title}
                </h4>
                <Link
                    href={`/view-design/${slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-all hover:scale-110 active:scale-95 shrink-0 border border-white/20"
                    title="Fullscreen Preview"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Card Body (Live Render Space) */}
            <div className="p-3">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-white relative group/preview shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] ring-1 ring-zinc-100">
                    <div className="absolute inset-0 origin-top-left w-[400%] h-[400%] scale-[0.25] pointer-events-none select-none">
                        <iframe
                            srcDoc={buildSrcDoc(html)}
                            className="w-full h-full border-none overflow-hidden"
                            title={title}
                            scrolling="no"
                        />
                    </div>
                    {/* Soft Overlay */}
                    <div className="absolute inset-0 bg-white/5 group-hover/preview:bg-transparent transition-colors duration-500 pointer-events-none" />

                    {/* Subtle Badge Overlay */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="px-2 py-1 bg-white/80 backdrop-blur-md rounded-md border border-zinc-200 flex items-center gap-1.5 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-brand-yellow" />
                            <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">Live Preview</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Footer - Silver Accents */}
            <div className="px-5 py-3.5 flex items-center justify-between bg-zinc-50/50 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter italic">Live Rendered</span>
                </div>
                <Link
                    href={`/view-design/${slug}`}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white rounded-full text-[10px] font-black hover:bg-brand-yellow hover:text-black transition-all duration-300 group/link border border-white/10 hover:border-black/10 shadow-lg shadow-black/5"
                >
                    PREVIEW
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {/* Hover Glow Effect - Gold */}
            <div className="absolute inset-0 border-2 border-brand-yellow/0 group-hover:border-brand-yellow/10 rounded-3xl pointer-events-none transition-all duration-500" />
        </div>
    );
}

