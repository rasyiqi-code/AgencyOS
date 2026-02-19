"use client";

import { useState } from "react";
import { PortfolioItem, savePortfolio, deletePortfolio } from "@/lib/portfolios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Globe, Code2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function PortfolioManager({ initialData }: { initialData: PortfolioItem[] }) {
    const [items, setItems] = useState(initialData);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [html, setHtml] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        if (!title || !slug || !html) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        try {
            const newItem = await savePortfolio({ title, slug, category, description: "" }, html);
            setItems([...items, newItem]);
            setIsAdding(false);
            // Reset form
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Portfolio Items</h2>
                    <p className="text-zinc-500 text-sm">Manage your live HTML website designs with ease.</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`font-bold transition-all duration-300 shadow-xl ${isAdding
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                        : "bg-gradient-to-br from-brand-yellow to-yellow-600 text-black hover:scale-105 active:scale-95 shadow-brand-yellow/20"
                        }`}
                >
                    {isAdding ? "Cancel Action" : <><Plus className="w-4 h-4 mr-2" /> Add New Project</>}
                </Button>
            </div>

            {isAdding && (
                <div className="p-8 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 blur-3xl rounded-full" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Project Title</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Banking Pro"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 hover:border-white/20 transition-all h-11"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL Slug</label>
                            <Input
                                value={slug}
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="banking-pro"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 hover:border-white/20 transition-all h-11 font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Industry</label>
                            <Input
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="Fintech"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 hover:border-white/20 transition-all h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Code2 className="w-3 h-3 text-brand-yellow" /> HTML Structure
                        </label>
                        <Textarea
                            value={html}
                            onChange={e => setHtml(e.target.value)}
                            placeholder="<!-- Paste clean, optimized HTML here -->"
                            className="bg-black/40 border-white/10 focus:border-brand-yellow/50 hover:border-white/20 transition-all min-h-[400px] font-mono text-xs leading-relaxed p-4"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-10 h-12 rounded-xl font-black shadow-lg shadow-brand-yellow/20 active:scale-95 transition-all"
                        >
                            {isSaving ? "Publishing..." : "Publish to Edge"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col justify-between group hover:border-brand-yellow/30 hover:bg-zinc-900/60 transition-all duration-500 gap-4 relative overflow-hidden"
                    >
                        {/* Subtle Card Glow */}
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-brand-yellow/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-brand-yellow group-hover:border-brand-yellow/20 shrink-0 transition-all duration-500 shadow-inner">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <h4 className="font-black text-white text-sm md:text-base truncate tracking-tight group-hover:text-brand-yellow transition-colors">{item.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <Badge variant="outline" className="text-[7px] md:text-[8px] px-1.5 py-0 uppercase tracking-widest border-white/10 bg-white/5 text-zinc-400 group-hover:border-brand-yellow/20 group-hover:text-brand-yellow/80 transition-colors">
                                        {item.category}
                                    </Badge>
                                    <span className="text-[10px] font-mono text-zinc-600 truncate group-hover:text-zinc-500 transition-colors">/{item.slug}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                <AlertTriangle className="w-3 h-3 text-brand-yellow/50" />
                                <span className="text-[8px] text-zinc-600 font-mono tracking-tighter uppercase">local fs storage</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg group-hover:bg-red-500/5 transition-all"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-zinc-900/10 border border-dashed border-white/5 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-600 text-sm">No portfolio items found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
