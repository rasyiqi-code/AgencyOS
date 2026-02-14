
"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash, Edit, Image as ImageIcon, FileText, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
                toast.success(editingAsset ? "Asset updated successfully" : "Asset created successfully");
                setIsDialogOpen(false);
                setEditingAsset(null);
                setFormData({ type: 'copy', title: '', content: '', category: '', file: null });
                setPreviewUrl(null);
                fetchAssets();
            } else {
                toast.error(editingAsset ? "Failed to update asset" : "Failed to create asset");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
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
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/admin/marketing/assets/${id}`, { method: "DELETE" });
            toast.success("Asset deleted");
            fetchAssets();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const filteredAssets = (type: string) => assets.filter(a => a.type === type);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Marketing Assets</h2>
                    <p className="text-zinc-400 text-sm">Manage banners, copy, and widgets for affiliates.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingAsset(null);
                        setFormData({ type: 'copy', title: '', content: '', category: '', file: null });
                        setPreviewUrl(null);
                        setIsDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Asset
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingAsset(null);
                        if (previewUrl && !assets.some(a => a.imageUrl === previewUrl)) {
                            // Only revoke if it's a blob url we created
                            if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                        }
                    }
                }}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{editingAsset ? "Edit Marketing Asset" : "Add New Marketing Asset"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Asset Type</Label>
                                    <div className="flex bg-zinc-800 rounded-lg p-1 overflow-x-auto">
                                        {['copy', 'banner', 'widget', 'banner_widget'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, type: type as "banner" | "copy" | "widget" | "banner_widget" })}
                                                className={`flex-1 min-w-[100px] text-xs font-medium py-1.5 rounded-md transition-all whitespace-nowrap ${formData.type === type
                                                    ? 'bg-zinc-600 text-white shadow-sm'
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                                    }`}
                                            >
                                                {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Q1 Promo Banner or Sales Email Script"
                                        className="bg-zinc-800 border-zinc-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Category (Optional)</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g. Social Media, Email"
                                        className="bg-zinc-800 border-zinc-700"
                                    />
                                </div>

                                {(formData.type === 'banner' || formData.type === 'banner_widget') && (
                                    <div className="space-y-2">
                                        <Label>Image File {formData.type === 'banner_widget' && "(Banner Image)"}</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                        <p className="text-xs text-zinc-500">Recommended size: 1200x630px for social sharing.</p>
                                    </div>
                                )}

                                {formData.type === 'banner_widget' && (
                                    <div className="space-y-2">
                                        <Label>Redirect URL (Optional)</Label>
                                        <Input
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="e.g. /pricing (defaults to home)"
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                        <p className="text-xs text-zinc-500">Affiliate ref code will be added automatically.</p>
                                    </div>
                                )}

                                {(formData.type === 'copy' || formData.type === 'widget') && (
                                    <div className="space-y-2">
                                        <Label>{formData.type === 'widget' ? 'Widget Code / Script' : 'Copy Content'}</Label>
                                        <Textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder={formData.type === 'widget' ? '<script>...</script>' : 'Write your marketing copy here...'}
                                            className="bg-zinc-800 border-zinc-700 min-h-[150px] font-mono text-sm"
                                        />
                                        {formData.type === 'copy' && (
                                            <p className="text-xs text-zinc-500">You can use variable {'{{REF_LINK}}'} to automatically insert affiliate link.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Live Preview Section */}
                            <div className="space-y-4 flex flex-col">
                                <Label className="text-zinc-500 flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Live Preview
                                </Label>
                                <div className="flex-1 bg-black/40 rounded-xl border border-zinc-800 p-4 min-h-[200px] flex flex-col justify-center overflow-hidden">
                                    {formData.type === 'copy' ? (
                                        <div className="text-sm text-zinc-300 whitespace-pre-wrap font-sans bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50">
                                            {formData.content.replace(/{{REF_LINK}}/g, "https://agency.com?ref=DEMO123") || "Begin typing your copy..."}
                                        </div>
                                    ) : (formData.type === 'banner' || formData.type === 'banner_widget') ? (
                                        <div className="space-y-3">
                                            <div className="aspect-video relative rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 group">
                                                {previewUrl ? (
                                                    <Image
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                                                        <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                                                        <span className="text-xs">No image selected</span>
                                                    </div>
                                                )}
                                            </div>
                                            {formData.type === 'banner_widget' && formData.content && (
                                                <div className="text-[10px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 p-2 rounded">
                                                    Target URL: {formData.content}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="font-mono text-[10px] text-blue-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800 overflow-x-auto max-h-[300px]">
                                            {formData.content || "// Widget code preview will appear here"}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-zinc-600 text-center italic">
                                    * This is how it will look in the affiliate toolkit.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={uploading} className="bg-blue-600 hover:bg-blue-500">
                                {uploading ? "Saving..." : editingAsset ? "Update Asset" : "Create Asset"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="copy" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="copy" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">
                        <FileText className="w-4 h-4 mr-2" /> Copywriting
                    </TabsTrigger>
                    <TabsTrigger value="banner" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">
                        <ImageIcon className="w-4 h-4 mr-2" /> Banners
                    </TabsTrigger>
                    <TabsTrigger value="widget" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">
                        <Code className="w-4 h-4 mr-2" /> Widgets
                    </TabsTrigger>
                    <TabsTrigger value="banner_widget" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">
                        <ImageIcon className="w-4 h-4 mr-2" /> Banner Ads
                    </TabsTrigger>
                </TabsList>

                {['copy', 'banner', 'widget', 'banner_widget'].map((type) => (
                    <TabsContent key={type} value={type} className="mt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAssets(type).map(asset => (
                                <Card key={asset.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-700 bg-zinc-950">
                                                {asset.category || 'General'}
                                            </Badge>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(asset)}
                                                    className="text-zinc-500 hover:text-blue-400"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    className="text-zinc-500 hover:text-red-500"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-base text-white leading-tight mt-2">{asset.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        {(asset.type === 'banner' || asset.type === 'banner_widget') && asset.imageUrl && (
                                            <div className="aspect-video relative rounded-md overflow-hidden bg-black/50 border border-zinc-800">
                                                <Image
                                                    src={asset.imageUrl}
                                                    alt={asset.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        {asset.type !== 'banner' && asset.type !== 'banner_widget' && asset.content && (
                                            <div className="bg-black/30 rounded-md p-3 text-xs font-mono text-zinc-400 h-[100px] overflow-y-auto whitespace-pre-wrap border border-zinc-800/50">
                                                {asset.content}
                                            </div>
                                        )}
                                        {asset.type === 'banner_widget' && asset.content && (
                                            <div className="mt-2 text-[10px] text-zinc-500 font-mono truncate">
                                                Target: {asset.content}
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
                                            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                            {/* Add Copy Button or other actions */}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredAssets(type).length === 0 && (
                                <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                    No {type} assets found.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

