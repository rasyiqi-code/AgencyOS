"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
import { ServiceImageUpload } from "@/components/admin/services/image-upload";
import { DynamicListInput } from "@/components/ui/dynamic-list-input";
import { Button } from "@/components/ui/button";
import { FileText, ListChecks, CreditCard } from "lucide-react";

// ... imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag } from "lucide-react";

export function CreateServiceForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        // Manual Validation for Bilingual Fields
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const titleId = formData.get("title_id") as string;
        const descriptionId = formData.get("description_id") as string;

        if (!title || !description || !titleId || !descriptionId) {
            toast.error("Please complete all fields in both English and Bahasa Indonesia.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/services", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Failed to create service");
            toast.success("Service published successfully!");
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to publish service");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Primary Information (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">

                {/* Visual Asset - Shared */}
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Service Thumbnail</h3>
                    <ServiceImageUpload />
                </div>

                <Tabs defaultValue="en" className="w-full">
                    <TabsList className="bg-zinc-900/40 border border-white/5 mb-4">
                        <TabsTrigger value="en">English (Default)</TabsTrigger>
                        <TabsTrigger value="id">Bahasa Indonesia</TabsTrigger>
                    </TabsList>

                    {/* ENGLISH CONTENT */}
                    <TabsContent value="en" className="space-y-6">
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-semibold text-white">General Information (EN)</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Service Title</label>
                                    <Input
                                        name="title"
                                        placeholder="e.g. Enterprise Web Development"
                                        required
                                        className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
                                    <RichTextEditorClient
                                        name="description"
                                        placeholder="Describe the value proposition..."
                                        required
                                        className="min-h-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-semibold text-white">Deliverables & Features (EN)</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Feature List</label>
                                    <DynamicListInput
                                        name="features"
                                        placeholder="Add features (e.g. 'Unlimited Revisions')"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* INDONESIAN CONTENT */}
                    <TabsContent value="id" className="space-y-6">
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <Flag className="w-4 h-4 text-red-500" />
                                <h3 className="text-sm font-semibold text-white">Informasi Umum (ID)</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Judul Layanan</label>
                                    <Input
                                        name="title_id"
                                        placeholder="Contoh: Pengembangan Web Enterprise"
                                        required
                                        className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-red-500/20 h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Deskripsi</label>
                                    <RichTextEditorClient
                                        name="description_id"
                                        placeholder="Jelaskan nilai layanan..."
                                        required
                                        className="min-h-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-semibold text-white">Fitur & Hasil (ID)</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Daftar Fitur</label>
                                    <DynamicListInput
                                        name="features_id"
                                        placeholder="Tambah fitur (Contoh: 'Revisi Tanpa Batas')"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Right Column: Configuration & Actions (1/3 width) */}
            <div className="lg:col-span-1 space-y-6">
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Pricing Model</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</label>
                            <div className="flex gap-2">
                                <Select name="currency" defaultValue="USD">
                                    <SelectTrigger className="w-[100px] bg-black/20 border-white/10 text-zinc-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="flex-1 bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 text-lg font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Billing Interval</label>
                            <Select name="interval" defaultValue="one_time">
                                <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one_time">One-time Payment</SelectItem>
                                    <SelectItem value="monthly">Monthly Subscription</SelectItem>
                                    <SelectItem value="yearly">Yearly Subscription</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-zinc-900/60 border-t border-white/5">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Publishing..." : "Publish Service"}
                        </Button>
                        <p className="text-[10px] text-center text-zinc-600 mt-3">
                            This service will be immediately visible in the catalog.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
