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

import { generateServiceAction } from '@/app/actions/genkit';
import { Sparkles, Loader2, ArrowLeft, Package } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { ServiceData } from "./edit-service-form";

interface DraftServiceData extends Partial<ServiceData> {
    recommended_price?: number;
}

export function CreateServiceForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Generation State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationKey, setGenerationKey] = useState(0); // Force re-render on generation
    const [generatedData, setGeneratedData] = useState<DraftServiceData | null>(null);

    async function handleGenerate() {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const res = await generateServiceAction(prompt);
            if (res.success && res.data) {
                setGeneratedData(res.data ?? null);
                setGenerationKey(prev => prev + 1);
                toast.success("Service drafted by AI!");
            } else {
                toast.error("Failed to generate content");
            }
        } catch (error) {
            console.error("AI Generation error:", error);
            toast.error("AI Error");
        } finally {
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
            const res = await fetch("/api/services", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create service");
            }

            toast.success("Service published successfully!");
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to publish service");
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
                            <Package className="w-6 h-6 text-blue-500" />
                            Create New Service
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
                                    <p className="text-[10px] text-indigo-300/80">Describe what you want to build and let AI handle the details.</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <Textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g. A high-end 3D character design service for game developers..."
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
                                                Crafting...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Auto-Fill Form
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
                        Design a new service offering. Set the pricing model, deliverables, and features.
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


                {/* Left Column: Primary Information (2/3 width) */}
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
                                            defaultValue={generatedData?.title ?? undefined}
                                            placeholder="e.g. Enterprise Web Development"
                                            required
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
                                        <RichTextEditorClient
                                            name="description"
                                            defaultValue={generatedData?.description ?? undefined}
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
                                            defaultValue={generatedData?.features || []}
                                            placeholder="Add features (e.g. 'Unlimited Revisions')"
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
                                            defaultValue={generatedData?.title_id ?? undefined}
                                            placeholder="Contoh: Pengembangan Web Enterprise"
                                            required
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-red-500/20 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Deskripsi</label>
                                        <RichTextEditorClient
                                            name="description_id"
                                            defaultValue={generatedData?.description_id ?? undefined}
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
                                            defaultValue={generatedData?.features_id || []}
                                            placeholder="Tambah fitur (Contoh: 'Revisi Tanpa Batas')"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Configuration & Actions (1/3 width) */}
                <div className="lg:col-span-1" key={`pricing-${generationKey}`}>
                    <div className="sticky top-8 space-y-6">
                        {/* Visual Asset - Shared */}
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Service Thumbnail</h3>
                            <ServiceImageUpload />
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
                                            defaultValue={generatedData?.recommended_price ?? undefined}
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
                </div>
            </form>
        </>
    );
}
