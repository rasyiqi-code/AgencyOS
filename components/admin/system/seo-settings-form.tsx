"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe, Save, Upload, Search } from "lucide-react";
import { toast } from "sonner";

export interface SeoSettings {
    title: string | null;
    description: string | null;
    keywords: string | null;
    ogImage: string | null;
    favicon: string | null;
    googleVerification: string | null;
    gaId: string | null;
}

interface Props {
    initialData: SeoSettings;
}

export function SeoSettingsForm({ initialData }: Props) {
    // ... existing state ...
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [data, setData] = useState<SeoSettings>(initialData);

    // ... handleFileUpload ...
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'ogImage' | 'favicon') {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/system/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const json = await res.json();
            setData(prev => ({ ...prev, [field]: json.url }));
            toast.success("Image uploaded!");
        } catch {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    }

    // ... handleSave ...
    async function handleSave() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/system/seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Failed");
            toast.success("SEO settings updated successfully");
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-white">Search Engine Optimization</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Configure global meta tags and social sharing previews.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">

                    {/* New: Google Integrations */}
                    <div className="space-y-4 pb-4 border-b border-white/5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Google Verification Code</Label>
                                <Input
                                    placeholder="google-site-verification=..."
                                    value={data.googleVerification || ""}
                                    onChange={(e) => setData({ ...data, googleVerification: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white font-mono text-xs"
                                />
                                <p className="text-[10px] text-zinc-500">For Google Search Console ownership verification.</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Google Analytics ID</Label>
                                <Input
                                    placeholder="G-XXXXXXXXXX"
                                    value={data.gaId || ""}
                                    onChange={(e) => setData({ ...data, gaId: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white font-mono text-xs"
                                />
                                <p className="text-[10px] text-zinc-500">GA4 Measurement ID.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Homepage Tagline / Keywords</Label>
                        <Input
                            placeholder="Digital Solutions & Growth Partner"
                            value={data.title || ""}
                            onChange={(e) => setData({ ...data, title: e.target.value })}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">Combined with Agency Name on homepage: &quot;Agency Name | Tagline&quot;</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Meta Description</Label>
                        <Textarea
                            placeholder="A brief description of your agency..."
                            value={data.description || ""}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            className="bg-black/50 border-white/10 text-white min-h-[100px]"
                        />
                        <p className="text-xs text-zinc-500">Recommended length: 150-160 characters.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Keywords</Label>
                        <Input
                            placeholder="agency, web design, marketing, software development"
                            value={data.keywords || ""}
                            onChange={(e) => setData({ ...data, keywords: e.target.value })}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">Comma-separated list of keywords.</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="text-zinc-300">Favicon</Label>
                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div className="relative w-16 h-16 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {data.favicon ? (
                                    <Image
                                        src={data.favicon}
                                        alt="Favicon Preview"
                                        fill
                                        className="object-contain p-2"
                                    />
                                ) : (
                                    <Globe className="w-6 h-6 text-zinc-600" />
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label
                                        htmlFor="favicon-upload"
                                        className={`inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Favicon
                                            </>
                                        )}
                                    </label>
                                    <Input
                                        id="favicon-upload"
                                        type="file"
                                        accept="image/x-icon,image/png,image/jpeg,image/svg+xml"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'favicon')}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Recommended: 32x32px or 16x16px (PNG/ICO).</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="text-zinc-300">Open Graph Image (Social Share)</Label>
                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div className="relative w-32 h-20 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {data.ogImage ? (
                                    <Image
                                        src={data.ogImage}
                                        alt="OG Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <Globe className="w-8 h-8 text-zinc-600" />
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label
                                        htmlFor="og-image-upload"
                                        className={`inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Image
                                            </>
                                        )}
                                    </label>
                                    <Input
                                        id="og-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'ogImage')}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Recommended size: 1200x630 pixels.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
