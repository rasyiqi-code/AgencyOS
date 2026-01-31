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

interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    interval: string;
    features: string[];
    features_id?: string[] | null;
    image: string | null;
}

export function EditServiceForm({ service, features, features_id }: { service: ServiceData, features: string[], features_id: string[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            const res = await fetch(`/api/services/${service.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to update service");

            toast.success("Service updated successfully!");
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update service");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <input type="hidden" name="id" value={service.id} />

            {/* Left Column: Primary Information */}
            <div className="lg:col-span-2 space-y-6">

                {/* Visual Asset - Shared */}
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Service Thumbnail</h3>
                    <ServiceImageUpload defaultValue={service.image} />
                </div>

                <Tabs defaultValue="en" className="w-full">
                    <TabsList className="bg-zinc-900/40 border border-white/5 mb-4">
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="id">Bahasa Indonesia</TabsTrigger>
                    </TabsList>

                    {/* ENGLISH */}
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
                                        defaultValue={service.title}
                                        placeholder="e.g. Enterprise Web Development"
                                        required
                                        className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
                                    <RichTextEditorClient
                                        name="description"
                                        defaultValue={service.description}
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
                                        defaultValue={features}
                                        placeholder="Add features..."
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* INDONESIAN */}
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
                                        defaultValue={service.title_id || ''}
                                        placeholder="Contoh: Pengembangan Web Enterprise"
                                        className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-red-500/20 h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Deskripsi</label>
                                    <RichTextEditorClient
                                        name="description_id"
                                        defaultValue={service.description_id || ''}
                                        placeholder="Jelaskan nilai layanan..."
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
                                        defaultValue={features_id}
                                        placeholder="Tambah fitur..."
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Right Column: Configuration & Actions */}
            <div className="lg:col-span-1 space-y-6">
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Pricing Model</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Price (USD)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                <Input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={service.price}
                                    placeholder="0.00"
                                    required
                                    className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 pl-7 text-lg font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Billing Interval</label>
                            <Select name="interval" defaultValue={service.interval}>
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
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
