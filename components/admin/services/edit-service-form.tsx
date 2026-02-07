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
import { FileText, ListChecks, CreditCard, Sparkles, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag } from "lucide-react";
// import { generateServiceAction } from '@/app/actions/genkit';
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

export interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency?: string;
    interval: string;
    features: string[];
    features_id?: string[] | null;
    image: string | null;
}

interface DraftServiceData extends Partial<ServiceData> {
    recommended_price?: number;
}

export function EditServiceForm({ service, features, features_id }: { service: ServiceData, features: string[], features_id: string[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Generation State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationKey, setGenerationKey] = useState(0);
    const [generatedData, setGeneratedData] = useState<DraftServiceData | null>(null);

    async function handleGenerate() {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/genkit/generate-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: prompt })
            });
            const result = await res.json();

            if (result.success) {
                setGeneratedData(result.data ?? null);
                setGenerationKey(prev => prev + 1);
                toast.success("AI has updated the form drafts!");
            } else {
                toast.error(result.error || "Failed to generate content");
            }
        } catch {
            setIsGenerating(false);
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const title_id = formData.get("title_id") as string;
        const description_id = formData.get("description_id") as string;

        if (!title || !description || !title_id || !description_id) {
            console.error("Validation failed. Missing fields:", { title, description, title_id, description_id });
            toast.error("Please complete all fields in both English and Bahasa Indonesia.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`/api/services/${service.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update service");
            }

            toast.success("Service updated successfully!");
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to update service");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Service Management</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                            Edit Service
                        </h1>

                        {/* AI Assistant Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                    <span className="text-xs font-semibold">AI Assistant</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 border-indigo-500/20 bg-zinc-900 shadow-2xl shadow-indigo-500/20" align="start">
                                <div className="p-4 border-b border-white/5 bg-indigo-500/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <h4 className="font-semibold text-white text-sm">Magic Draft</h4>
                                    </div>
                                    <p className="text-[10px] text-indigo-300/80">Describe update ideas and let AI draft the details.</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <Textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g. Add a premium tier with 24/7 support and custom icons..."
                                        className="bg-black/40 border-indigo-500/20 text-zinc-200 focus:ring-indigo-500/40 min-h-[100px] text-xs resize-none"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 h-9 transition-all active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Drafting...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Update Draft with AI
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
                        Update service details, pricing, and features.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/pm/services">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </Link>
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <input type="hidden" name="id" value={service.id} />

                {/* Left Column: Primary Information */}
                <div className="lg:col-span-2 space-y-6" key={generationKey}>
                    <Tabs defaultValue="en" className="w-full">
                        <TabsList className="bg-zinc-900/40 border border-white/5 mb-4">
                            <TabsTrigger value="en">English (Default)</TabsTrigger>
                            <TabsTrigger value="id">Bahasa Indonesia</TabsTrigger>
                        </TabsList>

                        {/* ENGLISH CONTENT */}
                        <TabsContent value="en" forceMount className="space-y-6 data-[state=inactive]:hidden">
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
                                            defaultValue={generatedData?.title ?? service.title}
                                            placeholder="e.g. Enterprise Web Development"
                                            required
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
                                        <RichTextEditorClient
                                            name="description"
                                            defaultValue={generatedData?.description ?? service.description}
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
                                            defaultValue={generatedData?.features || features}
                                            placeholder="Add features..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* INDONESIAN CONTENT */}
                        <TabsContent value="id" forceMount className="space-y-6 data-[state=inactive]:hidden">
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
                                            defaultValue={generatedData?.title_id ?? service.title_id ?? ''}
                                            placeholder="Contoh: Pengembangan Web Enterprise"
                                            required
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-red-500/20 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Deskripsi</label>
                                        <RichTextEditorClient
                                            name="description_id"
                                            defaultValue={generatedData?.description_id ?? service.description_id ?? ''}
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
                                            defaultValue={generatedData?.features_id || features_id}
                                            placeholder="Tambah fitur..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Configuration & Actions */}
                <div className="lg:col-span-1" key={`pricing-${generationKey}`}>
                    <div className="sticky top-8 space-y-6">
                        {/* Visual Asset - Shared */}
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Service Thumbnail</h3>
                            <ServiceImageUpload defaultValue={service.image || undefined} />
                        </div>

                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-violet-400" />
                                <h3 className="text-sm font-semibold text-white">Pricing Model</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</label>
                                    <div className="flex gap-2">
                                        <Select name="currency" defaultValue={service.currency || "USD"}>
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
                                            defaultValue={generatedData?.recommended_price ?? service.price}
                                            placeholder="0.00"
                                            required
                                            className="flex-1 bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 text-lg font-semibold"
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
                </div>
            </form>
        </>
    );
}
