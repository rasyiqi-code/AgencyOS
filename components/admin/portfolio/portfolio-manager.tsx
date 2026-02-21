"use client";

import { useState, useEffect } from "react";
import { PortfolioItem, savePortfolio, deletePortfolio, getPortfolioHtml } from "@/lib/portfolios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Plus, AlertTriangle, Layout, Maximize2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { HtmlFileUploader } from "./html-file-uploader";

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
        // Sisipkan style ke dalam <head> yang sudah ada, atau setelah <html> jika <head> tidak ditemukan
        if (/<head[\s>]/i.test(trimmed)) {
            return trimmed.replace(/<head([^>]*)>/i, `<head$1>${PREVIEW_HIDE_SCROLLBAR}`);
        }
        return trimmed.replace(/<html([^>]*)>/i, `<html$1><head>${PREVIEW_HIDE_SCROLLBAR}</head>`);
    }

    // Fragment HTML: bungkus dalam dokumen baru
    return `<html><head>${PREVIEW_HIDE_SCROLLBAR}</head><body>${content}</body></html>`;
}

// === Live Preview Component untuk Card ===
function PortfolioPreview({ slug, html: directHtml }: { slug?: string; html?: string }) {
    const [fetchedContent, setFetchedContent] = useState("");

    useEffect(() => {
        if (!directHtml && slug) {
            getPortfolioHtml(slug).then(setFetchedContent);
        }
    }, [slug, directHtml]);

    const content = directHtml || fetchedContent;

    return (
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-white relative group/preview shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] ring-1 ring-zinc-100">
            <div className="absolute inset-0 origin-top-left w-[400%] h-[400%] scale-[0.25] pointer-events-none select-none">
                <iframe
                    srcDoc={buildSrcDoc(content)}
                    className="w-full h-full border-none overflow-hidden"
                    title="Admin Preview"
                    scrolling="no"
                />
            </div>
            <div className="absolute inset-0 bg-white/5 group-hover/preview:bg-transparent transition-colors pointer-events-none" />
        </div>
    );
}

/**
 * Komponen utama untuk mengelola portfolio: list, tambah baru, dan hapus.
 * Mendukung 2 metode input HTML: paste code (editor IDE) dan upload file.
 */
export function PortfolioManager({ initialData }: { initialData: PortfolioItem[] }) {
    const [items, setItems] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [html, setHtml] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // === Handler: Simpan portfolio baru ===
    async function handleSave() {
        if (!title || !slug || !html) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        try {
            const newItem = await savePortfolio({ title, slug, category, description: "" }, html);
            setItems([...items, newItem]);
            setIsModalOpen(false);
            // Reset form setelah berhasil
            setTitle("");
            setSlug("");
            setCategory("");
            setHtml("");
            toast.success("Portfolio saved successfully");
        } catch {
            toast.error("Failed to save portfolio");
        } finally {
            setIsSaving(false);
        }
    }

    // === Handler: Hapus portfolio ===
    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this portfolio item?")) return;

        try {
            await deletePortfolio(id);
            setItems(items.filter(i => i.id !== id));
            toast.success("Deleted successfully");
        } catch {
            toast.error("Failed to delete");
        }
    }

    return (
        <div className="space-y-8">
            {/* === Header Section === */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-brand-yellow border-brand-yellow/20 bg-brand-yellow/5 uppercase tracking-widest text-[9px] font-bold">
                            Content Management
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                            Portfolio Live Admin
                        </h1>
                        <div className="hidden sm:flex p-2 rounded-xl bg-white/5 border border-white/10">
                            <Layout className="w-5 h-5 text-brand-yellow" />
                        </div>
                    </div>
                    <p className="text-zinc-500 max-w-xl text-sm md:text-base leading-relaxed">
                        Manage your website showcase and <span className="text-zinc-300">local HTML designs</span>.
                    </p>
                </div>

                <div className="shrink-0">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="font-bold transition-all duration-300 shadow-xl w-full md:w-auto bg-gradient-to-br from-brand-yellow to-yellow-600 text-black hover:scale-105 active:scale-95 shadow-brand-yellow/20"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Project
                    </Button>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

            {/* === Modal Form Tambah Portfolio Baru === */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open);
                // Reset form saat modal ditutup
                if (!open) {
                    setTitle("");
                    setSlug("");
                    setCategory("");
                    setHtml("");
                }
            }}>
                <DialogContent className="max-w-3xl bg-zinc-950 border-white/10 text-white p-4 gap-3">
                    <DialogHeader className="space-y-0 pb-0">
                        <DialogTitle className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-brand-yellow" /> New Project
                        </DialogTitle>
                        <DialogDescription className="sr-only">Form tambah portfolio baru</DialogDescription>
                    </DialogHeader>

                    {/* Row 1: 4 kolom — Title, Slug, Industry, Launch */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                        <div>
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-0.5 mb-1 block">Title</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Banking Pro"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 h-8 text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-0.5 mb-1 block">Slug</label>
                            <Input
                                value={slug}
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="banking-pro"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 h-8 font-mono text-[10px]"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-0.5 mb-1 block">Industry</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 focus:border-brand-yellow/50 h-8 text-xs rounded-md px-2 text-white appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                            >
                                <option value="" className="bg-zinc-900 text-zinc-400">Pilih...</option>
                                <option value="Design" className="bg-zinc-900">Design</option>
                                <option value="Fintech" className="bg-zinc-900">Fintech</option>
                                <option value="E-Commerce" className="bg-zinc-900">E-Commerce</option>
                                <option value="SaaS" className="bg-zinc-900">SaaS</option>
                                <option value="Healthcare" className="bg-zinc-900">Healthcare</option>
                                <option value="Education" className="bg-zinc-900">Education</option>
                                <option value="Real Estate" className="bg-zinc-900">Real Estate</option>
                                <option value="F&B" className="bg-zinc-900">F&B</option>
                                <option value="Travel" className="bg-zinc-900">Travel</option>
                                <option value="Media" className="bg-zinc-900">Media</option>
                                <option value="Agency" className="bg-zinc-900">Agency</option>
                                <option value="Portfolio" className="bg-zinc-900">Portfolio</option>
                                <option value="Lainnya" className="bg-zinc-900">Lainnya</option>
                            </select>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-5 h-8 rounded-lg font-black active:scale-95 transition-all text-xs uppercase tracking-wider whitespace-nowrap"
                        >
                            {isSaving ? "..." : "Launch"}
                        </Button>
                    </div>

                    {/* Row 2: Upload compact inline */}
                    <HtmlFileUploader onFileLoad={setHtml} currentHtml={html} compact />
                </DialogContent>
            </Dialog>

            {/* === Grid Portfolio Items === */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group bg-white border border-zinc-200 rounded-3xl flex flex-col overflow-hidden hover:border-brand-yellow/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-brand-yellow/5 relative"
                    >
                        {/* Card Header */}
                        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 bg-white/50 backdrop-blur-sm">
                            <h4 className="font-bold text-zinc-900 text-base tracking-tight truncate pr-4 group-hover:text-brand-yellow transition-colors">
                                {item.title}
                            </h4>
                            <div className="p-2 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-brand-yellow group-hover:bg-brand-yellow/10 transition-all border border-zinc-200 cursor-pointer">
                                <Maximize2 className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Card Body (Live Render) */}
                        <div className="p-3">
                            <PortfolioPreview slug={item.slug} />
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 py-3.5 flex items-center justify-between bg-zinc-50/50 border-t border-zinc-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 font-mono italic">Live Rendered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`/view-design/${item.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 text-[10px] font-black text-zinc-800 hover:text-brand-yellow transition-colors tracking-widest uppercase"
                                >
                                    PREVIEW
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                <div className="h-3 w-px bg-zinc-200" />
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Hover Overlay Glow */}
                        <div className="absolute inset-0 border-2 border-brand-yellow/0 group-hover:border-brand-yellow/10 rounded-3xl pointer-events-none transition-all duration-500" />
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-12 bg-zinc-900/10 border border-dashed border-white/5 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-600 text-sm">No portfolio items found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
