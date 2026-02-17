
"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash, Edit, Image as ImageIcon, FileText, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/shared/utils";
import Image from "next/image";
// We should check how manual payment uploads. It uses a route handler.
// We need an upload route for this. Or reuse /api/billing/proof if generic enough? 
// Better creates a specific upload function/route or use a signed URL.
// For now, let's assume we implement a simple upload handler inside the component or a helper.
// Wait, `components/payment/manual/manual-payment.tsx` uses `/api/billing/proof` which calls `uploadFile`.
// I should create `/api/admin/marketing/upload` or handle upload in the POST route.
// Let's handle upload in the component by calling an API.

interface MarketingAsset {
    id: string;
    type: 'banner' | 'copy' | 'widget' | 'banner_widget';
    title: string;
    content?: string;
    imageUrl?: string;
    category?: string;
    isActive: boolean;
    createdAt: string;
}

export function AssetsManager() {
    const [assets, setAssets] = useState<MarketingAsset[]>([]);
    const [, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editingAsset, setEditingAsset] = useState<MarketingAsset | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        type: 'banner' | 'copy' | 'widget' | 'banner_widget';
        title: string;
        content: string;
        category: string;
        file: File | null;
    }>({
        type: 'copy',
        title: '',
        content: '',
        category: '',
        file: null
    });

    const fetchAssets = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/marketing/assets");
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error("Failed to fetch assets", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, file });

            // Generate preview URL
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleSubmit = async () => {
        setUploading(true);
        try {
            let imageUrl = editingAsset?.imageUrl || "";

            // Upload Image if Banner or Banner Widget, and a new file is chosen
            if ((formData.type === 'banner' || formData.type === 'banner_widget') && formData.file) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", formData.file);

                // We need an upload endpoint. 
                // Let's reuse /api/billing/proof logic but create a new generic upload route or just put it here
                // properly. For now, I'll simulate or use a new route.
                // I will create `/api/upload` generic route later or specific `/api/admin/marketing/upload`.
                // For now assuming `/api/admin/marketing/upload` exists.
                const uploadRes = await fetch("/api/admin/marketing/upload", {
                    method: "POST",
                    body: uploadFormData
                });

                if (uploadRes.ok) {
                    const json = await uploadRes.json();
                    imageUrl = json.url;
                } else {
                    throw new Error("Upload failed");
                }
            }

            const payload = {
                type: formData.type,
                title: formData.title,
                content: formData.content,
                category: formData.category,
                imageUrl: imageUrl || undefined
            };

            const url = editingAsset ? `/api/admin/marketing/assets/${editingAsset.id}` : "/api/admin/marketing/assets";
            const method = editingAsset ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingAsset ? "Aset berhasil diperbarui" : "Aset berhasil dibuat");
                setIsDialogOpen(false);
                setEditingAsset(null);
                setFormData({ type: 'copy', title: '', content: '', category: '', file: null });
                setPreviewUrl(null);
                fetchAssets();
            } else {
                toast.error(editingAsset ? "Gagal memperbarui aset" : "Gagal membuat aset");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (asset: MarketingAsset) => {
        setEditingAsset(asset);
        setFormData({
            type: asset.type,
            title: asset.title,
            content: asset.content || "",
            category: asset.category || "",
            file: null
        });
        setPreviewUrl(asset.imageUrl || null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;
        try {
            await fetch(`/api/admin/marketing/assets/${id}`, { method: "DELETE" });
            toast.success("Aset berhasil dihapus");
            fetchAssets();
        } catch {
            toast.error("Gagal menghapus aset");
        }
    };

    const filteredAssets = (type: string) => assets.filter(a => a.type === type);

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tight">Aset Marketing</h2>
                    <p className="text-zinc-500 text-[9px] md:text-sm font-medium">Kelola banner, copy, dan widget untuk afiliasi.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingAsset(null);
                        setFormData({ type: 'copy', title: '', content: '', category: '', file: null });
                        setPreviewUrl(null);
                        setIsDialogOpen(true);
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white gap-2 h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-widest px-6 shadow-xl shadow-blue-500/10"
                >
                    <Plus className="w-3.5 h-3.5" /> Tambah Aset
                </Button>

                {/* Dialog content omitted for brevity, keeping as is unless needed */}
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingAsset(null);
                        if (previewUrl && !assets.some(a => a.imageUrl === previewUrl)) {
                            if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                        }
                    }
                }}>
                    <DialogContent className="bg-zinc-950 border-white/5 text-white sm:max-w-4xl p-0 overflow-hidden">
                        <DialogHeader className="p-4 border-b border-white/5 bg-zinc-900/50">
                            <DialogTitle className="text-sm font-black uppercase tracking-widest">{editingAsset ? "Edit Aset" : "Aset Marketing Baru"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid md:grid-cols-2 gap-0 overflow-y-auto max-h-[80vh]">
                            <div className="p-4 md:p-6 space-y-4 border-b md:border-b-0 md:border-r border-white/5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Type</Label>
                                    <div className="flex bg-zinc-900/50 rounded-lg p-1 overflow-x-auto no-scrollbar border border-white/5">
                                        {['copy', 'banner', 'widget', 'banner_widget'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, type: type as "banner" | "copy" | "widget" | "banner_widget" })}
                                                className={cn(
                                                    "flex-1 min-w-[80px] text-[9px] font-black uppercase tracking-tighter py-1.5 rounded-md transition-all whitespace-nowrap",
                                                    formData.type === type ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                                )}
                                            >
                                                {type.split('_').join(' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Q1 Promo Banner"
                                        className="bg-black/40 border-white/10 h-9 text-sm focus:border-blue-500/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g. Social Media, Email"
                                        className="bg-black/40 border-white/10 h-9 text-sm focus:border-blue-500/50 transition-colors"
                                    />
                                </div>

                                {(formData.type === 'banner' || formData.type === 'banner_widget') && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Image File</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="bg-black/40 border-white/10 h-9 text-xs file:bg-zinc-800 file:border-0 file:text-[9px] file:uppercase file:font-black file:tracking-widest file:text-zinc-400 file:mr-3 hover:file:bg-zinc-700 cursor-pointer"
                                        />
                                    </div>
                                )}

                                {formData.type === 'banner_widget' && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Redirect URL</Label>
                                        <Input
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="e.g. /pricing"
                                            className="bg-black/40 border-white/10 h-9 text-sm focus:border-blue-500/50 transition-colors"
                                        />
                                    </div>
                                )}

                                {(formData.type === 'copy' || formData.type === 'widget') && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{formData.type === 'widget' ? 'Widget Code' : 'Copy Content'}</Label>
                                        <Textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder={formData.type === 'widget' ? '<script>...</script>' : 'Write your marketing copy here...'}
                                            className="bg-black/40 border-white/10 min-h-[120px] font-mono text-xs focus:border-blue-500/50 transition-colors"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Live Preview Section */}
                            <div className="p-4 md:p-6 bg-zinc-900/30 flex flex-col space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> Preview
                                </Label>
                                <div className="flex-1 bg-black/50 rounded-xl border border-white/5 p-3 flex flex-col justify-center overflow-hidden min-h-[180px]">
                                    {formData.type === 'copy' ? (
                                        <div className="text-[11px] text-zinc-400 whitespace-pre-wrap font-sans bg-zinc-950/80 p-3 rounded-lg border border-white/5">
                                            {formData.content.replace(/{{REF_LINK}}/g, "https://agency.com?ref=DEMO123") || "Preview will appear here..."}
                                        </div>
                                    ) : (formData.type === 'banner' || formData.type === 'banner_widget') ? (
                                        <div className="space-y-3">
                                            <div className="aspect-video relative rounded-lg overflow-hidden bg-zinc-950 border border-white/5">
                                                {previewUrl ? (
                                                    <Image
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                                                        <ImageIcon className="w-8 h-8 mb-2 opacity-10" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            {formData.type === 'banner_widget' && formData.content && (
                                                <div className="text-[9px] text-zinc-600 font-mono bg-black/40 border border-white/5 p-2 rounded truncate">
                                                    Target: {formData.content}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="font-mono text-[9px] text-blue-400/80 bg-zinc-950/80 p-3 rounded-lg border border-white/5 overflow-x-auto max-h-[250px]">
                                            {formData.content || "// Widget code preview..."}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-zinc-600 text-center italic font-medium">
                                    * Real appearance in affiliate toolkit.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="p-4 bg-zinc-900/50 border-t border-white/5 flex flex-row justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-[10px] font-black uppercase tracking-widest h-8 px-4">Batal</Button>
                            <Button onClick={handleSubmit} disabled={uploading} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest h-8 px-6 shadow-lg shadow-blue-500/10">
                                {uploading ? "Menyimpan..." : editingAsset ? "Perbarui" : "Buat"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="copy" className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-1">
                    <TabsList className="bg-zinc-900/50 border border-white/5 min-w-max md:w-auto h-11 md:h-12 p-1 rounded-xl shadow-xl shadow-black/20 flex items-center gap-1">
                        <TabsTrigger value="copy" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest h-9 md:h-10 px-4 md:px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Text</span>
                        </TabsTrigger>
                        <TabsTrigger value="banner" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest h-9 md:h-10 px-4 md:px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Banners</span>
                        </TabsTrigger>
                        <TabsTrigger value="widget" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest h-9 md:h-10 px-4 md:px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                            <Code className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Custom</span>
                        </TabsTrigger>
                        <TabsTrigger value="banner_widget" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest h-9 md:h-10 px-4 md:px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Ads</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {['copy', 'banner', 'widget', 'banner_widget'].map((type) => (
                    <TabsContent key={type} value={type} className="mt-4 focus-visible:outline-none">
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredAssets(type).map(asset => (
                                <Card key={asset.id} className="bg-zinc-900/40 border-white/5 overflow-hidden group hover:border-white/10 transition-all">
                                    <div className="p-3 md:p-4 pb-2 md:pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-zinc-500 border-white/5 bg-black/20 px-1.5 h-4">
                                                {asset.category || 'General'}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(asset)}
                                                    className="text-zinc-600 hover:text-blue-400 transition-colors"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    className="text-zinc-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-black text-white leading-tight uppercase tracking-tight truncate">{asset.title}</h3>
                                    </div>
                                    <div className="px-3 md:p-4 pt-1 md:pt-1 pb-3 md:pb-4">
                                        {(asset.type === 'banner' || asset.type === 'banner_widget') && asset.imageUrl && (
                                            <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <Image
                                                    src={asset.imageUrl}
                                                    alt={asset.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        {asset.type !== 'banner' && asset.type !== 'banner_widget' && asset.content && (
                                            <div className="bg-black/40 rounded-lg p-3 text-[10px] font-mono text-zinc-400 h-[80px] md:h-[100px] overflow-y-auto whitespace-pre-wrap border border-white/5 scrollbar-thin scrollbar-thumb-zinc-800">
                                                {asset.content}
                                            </div>
                                        )}
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[9px] text-zinc-600 font-bold font-mono uppercase tracking-tighter">
                                                {new Date(asset.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {asset.type === 'banner_widget' && asset.content && (
                                                <span className="text-[8px] text-zinc-700 font-black uppercase truncate max-w-[100px]">
                                                    LINK: {asset.content}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {filteredAssets(type).length === 0 && (
                                <div className="col-span-full py-12 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/20">
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                        <Plus className="w-8 h-8 text-zinc-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aset {type} tidak ditemukan</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

