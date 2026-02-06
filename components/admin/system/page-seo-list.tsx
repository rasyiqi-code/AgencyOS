"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageSeo {
    id: string;
    path: string;
    title: string | null;
    title_id: string | null;
    description: string | null;
    description_id: string | null;
    keywords: string | null;
    keywords_id: string | null;
    ogImage: string | null;
}

interface Props {
    initialPages: PageSeo[];
}

export function PageSeoList({ initialPages }: Props) {
    const [pages, setPages] = useState<PageSeo[]>(initialPages);
    const [isOpen, setIsOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<PageSeo | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        path: "",
        title: "",
        title_id: "",
        description: "",
        description_id: "",
        keywords: "",
        keywords_id: "",
        ogImage: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    function handleEdit(page: PageSeo) {
        setEditingPage(page);
        setFormData({
            path: page.path,
            title: page.title || "",
            title_id: page.title_id || "",
            description: page.description || "",
            description_id: page.description_id || "",
            keywords: page.keywords || "",
            keywords_id: page.keywords_id || "",
            ogImage: page.ogImage || ""
        });
        setIsOpen(true);
    }

    function handleAddNew() {
        setEditingPage(null);
        setFormData({
            path: "",
            title: "",
            title_id: "",
            description: "",
            description_id: "",
            keywords: "",
            keywords_id: "",
            ogImage: ""
        });
        setIsOpen(true);
    }

    async function handleSubmit() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/system/seo/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to save");

            const savedPage = await res.json();

            if (editingPage) {
                setPages(pages.map(p => p.id === savedPage.id ? savedPage : p));
                toast.success("Page updated successfully");
            } else {
                setPages([...pages, savedPage]);
                toast.success("Page added successfully");
            }
            setIsOpen(false);
            router.refresh();
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this configuration?")) return;

        try {
            const res = await fetch(`/api/system/seo/pages/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete");

            setPages(pages.filter(p => p.id !== id));
            toast.success("Configuration deleted");
            router.refresh();
        } catch {
            toast.error("Failed to delete");
        }
    }

    return (
        <Card className="bg-zinc-900/40 border-white/5">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-medium">Configured Pages ({pages.length})</h3>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddNew} size="sm" className="bg-white text-black hover:bg-zinc-200">
                                <Plus className="w-4 h-4 mr-2" /> Add Page
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingPage ? "Edit Page SEO" : "Add New Page SEO"}</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Configure specific title, meta tags, and content for a route.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Path (URL)</Label>
                                    <Input
                                        placeholder="/services"
                                        value={formData.path}
                                        onChange={e => setFormData({ ...formData, path: e.target.value })}
                                        className="bg-black/50 border-white/10 font-mono"
                                        disabled={!!editingPage}
                                    />
                                    <p className="text-[10px] text-zinc-500">Must start with /</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Meta Title (EN)</Label>
                                        <Input
                                            placeholder="Page Title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Meta Title (ID)</Label>
                                        <Input
                                            placeholder="Judul Halaman"
                                            value={formData.title_id}
                                            onChange={e => setFormData({ ...formData, title_id: e.target.value })}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Meta Description (EN)</Label>
                                        <Textarea
                                            placeholder="Description..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Meta Description (ID)</Label>
                                        <Textarea
                                            placeholder="Deskripsi..."
                                            value={formData.description_id}
                                            onChange={e => setFormData({ ...formData, description_id: e.target.value })}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Keywords (EN)</Label>
                                        <Input
                                            placeholder="keyword1, keyword2"
                                            value={formData.keywords}
                                            onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Keywords (ID)</Label>
                                        <Input
                                            placeholder="kata kunci, ..."
                                            value={formData.keywords_id}
                                            onChange={e => setFormData({ ...formData, keywords_id: e.target.value })}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>OG Image URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={formData.ogImage}
                                        onChange={e => setFormData({ ...formData, ogImage: e.target.value })}
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                                <Button onClick={handleSubmit} disabled={isLoading} className="bg-white text-black hover:bg-zinc-200">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Configuration"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-3">
                    {pages.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
                            <p className="text-zinc-500 text-sm">No page configurations yet.</p>
                        </div>
                    ) : (
                        pages.map(page => (
                            <div key={page.id} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-black/20 hover:border-white/10 transition-colors group">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-[10px] text-zinc-400 border-zinc-800">{page.path}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{page.title || "No Title Set"}</p>
                                                <p className="text-xs text-zinc-500 truncate max-w-md">{page.description || "No description set"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={page.path} target="_blank">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button onClick={() => handleEdit(page)} size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-blue-400 hover:bg-blue-950/20">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button onClick={() => handleDelete(page.id)} size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
