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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Portfolio Items</h2>
                    <p className="text-zinc-500 text-sm">Manage your live HTML website designs.</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-primary hover:bg-primary/90 text-white font-bold"
                >
                    {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add New</>}
                </Button>
            </div>

            {isAdding && (
                <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Title</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Banking Dashboard"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Slug (URL)</label>
                            <Input
                                value={slug}
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="e.g. banking-dashboard"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Category</label>
                            <Input
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="e.g. Fintech"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Code2 className="w-4 h-4" /> HTML Code
                        </label>
                        <Textarea
                            value={html}
                            onChange={e => setHtml(e.target.value)}
                            placeholder="Paste your HTML here..."
                            className="bg-black/20 border-white/10 min-h-[300px] font-mono text-xs leading-relaxed"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-white px-8"
                        >
                            {isSaving ? "Saving..." : "Save Portfolio"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 bg-zinc-900/30 border border-white/5 rounded-lg flex items-center justify-between group hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{item.category}</Badge>
                                    <span className="text-[10px] text-zinc-600">/{item.slug}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden group-hover:flex items-center gap-2 mr-4">
                                <span className="text-[10px] text-zinc-600 italic">Saved in root/data/portfolios/html</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Trash2 className="w-4 h-4" />
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
