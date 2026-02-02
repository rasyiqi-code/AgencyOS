"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe, Save } from "lucide-react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ContactInfo {
    email: string | null;
    phone: string | null;
    address: string | null;
    logoUrl: string | null;
    agencyName: string | null;
    companyName: string | null;
    logoDisplayMode: string | null;
    servicesTitle: string | null;
    servicesSubtitle: string | null;
}

interface Props {
    initialData: ContactInfo;
}

export function GeneralSettingsForm({ initialData }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [data, setData] = useState<ContactInfo>(initialData);

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
            setData(prev => ({ ...prev, logoUrl: json.url }));
            toast.success("Logo uploaded!");
        } catch {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    }

    async function handleSave() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/system/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Failed");
            toast.success("General settings updated successfully");
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
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-white">General & Public Information</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Manage contact details and page customization.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <Label className="text-zinc-300">Brand Logo</Label>

                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div className="relative w-16 h-16 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {data.logoUrl ? (
                                    <Image
                                        src={data.logoUrl}
                                        alt="Logo"
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <Globe className="w-6 h-6 text-zinc-600" />
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label
                                        htmlFor="logo-upload"
                                        className={`inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : "Upload New Logo"}
                                    </label>
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-400">Display Mode</Label>
                                    <Select
                                        value={data.logoDisplayMode || "both"}
                                        onValueChange={(val) => setData({ ...data, logoDisplayMode: val })}
                                    >
                                        <SelectTrigger className="w-full bg-black/50 border-white/10 text-white h-8 text-xs">
                                            <SelectValue placeholder="Display Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="both">Logo + Text</SelectItem>
                                            <SelectItem value="logo">Logo Only</SelectItem>
                                            <SelectItem value="text">Text Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Public Email</Label>
                        <Input
                            placeholder="hello@crediblemark.com"
                            value={data.email || ""}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">Displayed in the contact section.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Agency Name (Brand)</Label>
                        <Input
                            placeholder="e.g. AgencyOS"
                            value={data.agencyName || ""}
                            onChange={(e) => setData({ ...data, agencyName: e.target.value })}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">Used in Headers, Emails, and Titles.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Company Name (Legal)</Label>
                        <Input
                            placeholder="e.g. Crediblemark Pte Ltd"
                            value={data.companyName || ""}
                            onChange={(e) => setData({ ...data, companyName: e.target.value })}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">Used in Invoices, Terms, and Footer.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Phone Number</Label>
                        <Input
                            placeholder="+65 6688 8868"
                            value={data.phone || ""}
                            onChange={(e) => setData({ ...data, phone: e.target.value })}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">Includes format (e.g. Mon-Fri details).</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-300">Office Address</Label>
                    <Textarea
                        placeholder="Level 39, Marina Bay Financial Centre..."
                        value={data.address || ""}
                        onChange={(e) => setData({ ...data, address: e.target.value })}
                        className="bg-black/50 border-white/10 text-white min-h-[100px]"
                    />
                    <p className="text-xs text-zinc-500">Supports multi-line addresses.</p>
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
