"use client";

import { useState, ReactNode } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Languages, Sparkles, Pencil } from "lucide-react";
import { ProductImageUpload } from "./product-image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().min(0),
    name_id: z.string().min(0),
    description_id: z.string().min(0),
    price: z.number().min(0, "Price must be positive"),
    type: z.enum(["plugin", "template"]),
    isActive: z.boolean(),
    purchaseType: z.enum(["one_time", "subscription"]),
    interval: z.string().min(0),
    fileUrl: z.string().min(0),
    image: z.string().min(0),
    currency: z.enum(["USD", "IDR"]),
});

type ProductFormValues = {
    name: string;
    slug: string;
    description: string;
    name_id: string;
    description_id: string;
    price: number;
    type: "plugin" | "template";
    isActive: boolean;
    purchaseType: "one_time" | "subscription";
    interval: string;
    fileUrl: string;
    image: string;
    currency: "USD" | "IDR";
};

interface ProductFormProps {
    product?: Product;
    onSuccess?: () => void;
    trigger?: ReactNode;
}

export function ProductForm({ product, onSuccess, trigger }: ProductFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // AI Generation State
    const [magicPrompt, setMagicPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: product ? {
            name: product.name,
            name_id: (product as Product & { name_id?: string }).name_id ?? "",
            slug: product.slug,
            description: product.description ?? "",
            description_id: (product as Product & { description_id?: string }).description_id ?? "",
            price: product.price ? Number(product.price) : 0,
            type: (product.type as "plugin" | "template") || "plugin",
            image: product.image ?? "",
            purchaseType: (product.purchaseType as "one_time" | "subscription") || "one_time",
            fileUrl: product.fileUrl ?? "",
            isActive: product.isActive ?? true,
            interval: product.interval ?? "",
            currency: (product as Product & { currency?: string }).currency as "USD" | "IDR" || "USD",
        } : {
            name: "",
            name_id: "",
            slug: "",
            description: "",
            description_id: "",
            price: 0,
            type: "plugin",
            image: "",
            purchaseType: "one_time",
            fileUrl: "",
            isActive: true,
            interval: "",
            currency: "USD",
        }
    });

    async function handleMagicDraft() {
        if (!magicPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/genkit/generate-product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: magicPrompt })
            });
            const result = await res.json();

            if (result.success) {
                const data = result.data;
                form.setValue("name", data.name);
                form.setValue("name_id", data.name_id);
                form.setValue("description", data.description);
                form.setValue("description_id", data.description_id);
                form.setValue("slug", data.slug);
                form.setValue("price", data.recommended_price);

                toast.success("AI has filled the form for you!");
                setMagicPrompt("");
            } else {
                toast.error(result.error || "Failed to generate content");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error while generating draft");
        } finally {
            setIsGenerating(false);
        }
    }

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        setLoading(true);
        try {
            const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
            const method = product ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to save product");
            }

            toast.success(product ? "Product updated" : "Product created");
            setOpen(false);
            router.refresh();
            onSuccess?.();
            if (!product) form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant={product ? "ghost" : "default"}
                        size={product ? "icon" : "default"}
                        className={product
                            ? "h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-brand-yellow transition-all"
                            : "h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 md:px-5 bg-brand-yellow text-black hover:bg-brand-yellow/90"
                        }
                    >
                        {product ? (
                            <Pencil className="w-4 h-4" />
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-zinc-950 border-white/5 p-4 md:p-6 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-custom">
                <DialogHeader className="flex-row items-center justify-between space-y-0 pb-6 border-b border-white/5">
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                            <Plus className={`w-5 h-5 ${product ? 'rotate-45' : ''} text-brand-yellow`} />
                            {product ? "Update Product" : "Launch New Product"}
                        </DialogTitle>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Product Management System</p>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2 bg-brand-yellow/5 border-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow/10 transition-all hover:scale-105 active:scale-95 px-4"
                            >
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Magic Draft</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-brand-yellow/20 bg-zinc-950 shadow-2xl shadow-brand-yellow/10" align="end">
                            <div className="p-4 border-b border-white/5 bg-brand-yellow/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-brand-yellow" />
                                    <h4 className="font-black text-white text-[10px] uppercase tracking-widest">AI Content Generator</h4>
                                </div>
                                <p className="text-[9px] text-brand-yellow/60 font-bold uppercase tracking-tight">Briefly describe your product idea.</p>
                            </div>
                            <div className="p-4 space-y-4">
                                <Textarea
                                    value={magicPrompt}
                                    onChange={(e) => setMagicPrompt(e.target.value)}
                                    placeholder="e.g. A premium blog theme for personal branding with dark mode support..."
                                    className="bg-black/40 border-white/5 text-zinc-200 focus:ring-brand-yellow/40 min-h-[100px] text-xs resize-none scrollbar-custom"
                                />
                                <Button
                                    type="button"
                                    onClick={handleMagicDraft}
                                    disabled={isGenerating || !magicPrompt.trim()}
                                    className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-black uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-brand-yellow/10 transition-all active:scale-95"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Drafting...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Details
                                        </>
                                    )}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        {/* Kolom Kiri: Informasi Inti & Lokalisasi */}
                        <div className="lg:col-span-3 space-y-6">
                            <Tabs defaultValue="en" className="w-full">
                                <TabsList className="bg-zinc-900/40 border border-white/5 mb-4 p-1 rounded-xl h-11">
                                    <TabsTrigger
                                        value="en"
                                        className="rounded-lg px-6 data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Languages className="w-3.5 h-3.5 mr-2" />
                                        English (Default)
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="id"
                                        className="rounded-lg px-6 data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Languages className="w-3.5 h-3.5 mr-2" />
                                        Bahasa Indonesia
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="en" className="space-y-5 animate-in fade-in-50 duration-300">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Name (EN)</Label>
                                        <Input
                                            {...form.register("name")}
                                            placeholder="e.g. SEO Booster Plugin"
                                            className="bg-black/50 border-white/5 rounded-xl h-12 text-sm focus:border-brand-yellow/30 transition-colors"
                                        />
                                        {form.formState.errors.name && (
                                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (EN)</Label>
                                        <Textarea
                                            {...form.register("description")}
                                            className="min-h-[120px] bg-black/50 border-white/5 rounded-2xl text-sm resize-none focus:border-brand-yellow/30 transition-all scrollbar-custom"
                                            placeholder="Tell us about this product in English..."
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="id" className="space-y-5 animate-in fade-in-50 duration-300">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-brand-yellow/60">Product Name (ID)</Label>
                                        <Input
                                            {...form.register("name_id")}
                                            placeholder="contoh: Plugin Pendongkrak SEO"
                                            className="bg-brand-yellow/5 border-brand-yellow/10 rounded-xl h-12 text-sm focus:border-brand-yellow/30 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-brand-yellow/60">Description (ID)</Label>
                                        <Textarea
                                            {...form.register("description_id")}
                                            className="min-h-[120px] bg-brand-yellow/5 border-brand-yellow/10 rounded-2xl text-sm resize-none focus:border-brand-yellow/30 transition-all scrollbar-custom"
                                            placeholder="Beritahu kami tentang produk ini dalam Bahasa Indonesia..."
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Slug</Label>
                                        <Input
                                            {...form.register("slug")}
                                            placeholder="seo-booster-plugin"
                                            className="bg-black/50 border-white/5 rounded-xl h-11 text-xs focus:border-brand-yellow/30 transition-colors"
                                        />
                                        {form.formState.errors.slug && (
                                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{form.formState.errors.slug.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Type</Label>
                                        <select
                                            {...form.register("type")}
                                            className="flex h-11 w-full rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow/30 appearance-none cursor-pointer"
                                        >
                                            <option value="plugin" className="bg-zinc-900">Plugin</option>
                                            <option value="template" className="bg-zinc-900">Template</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price</Label>
                                        <div className="flex gap-2">
                                            <select
                                                {...form.register("currency")}
                                                className="flex h-11 w-[80px] rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-[10px] font-black ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow/30 appearance-none cursor-pointer uppercase tracking-widest"
                                            >
                                                <option value="USD" className="bg-zinc-900">USD ($)</option>
                                                <option value="IDR" className="bg-zinc-900">IDR (Rp)</option>
                                            </select>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...form.register("price", { valueAsNumber: true })}
                                                placeholder="0.00"
                                                className="bg-black/50 border-white/5 rounded-xl h-11 text-xs focus:border-brand-yellow/30 transition-colors font-mono flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Purchase Type</Label>
                                        <select
                                            {...form.register("purchaseType")}
                                            className="flex h-11 w-full rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow/30 appearance-none cursor-pointer"
                                        >
                                            <option value="one_time" className="bg-zinc-900">One Time Payment</option>
                                            <option value="subscription" className="bg-zinc-900">Subscription Base</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Media & Preview Sidebar */}
                        <div className="lg:col-span-2 space-y-4 bg-white/5 p-4 rounded-3xl border border-white/5 shadow-inner">
                            <ProductImageUpload
                                value={form.watch("image")}
                                onChange={(url) => form.setValue("image", url)}
                                onRemove={() => form.setValue("image", "")}
                            />

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Download Link / URL</Label>
                                <Input
                                    {...form.register("fileUrl")}
                                    placeholder="https://storage.com/file.zip"
                                    className="bg-black/50 border-white/5 rounded-xl h-11 text-xs focus:border-brand-yellow/30 transition-colors"
                                />
                            </div>

                            {form.watch("purchaseType") === "subscription" && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Billing Interval</Label>
                                    <select
                                        {...form.register("interval")}
                                        className="flex h-11 w-full rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-xs appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-zinc-900">Select Interval</option>
                                        <option value="month" className="bg-zinc-900">Monthly Billing</option>
                                        <option value="year" className="bg-zinc-900">Yearly Billing</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/5 text-center">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    Finalize all product assets and pricing before launching.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center space-x-3 bg-black/20 p-2 px-3 rounded-full border border-white/5 w-full md:w-auto">
                            <Switch
                                id="product-active"
                                checked={form.watch("isActive")}
                                onCheckedChange={(checked) => form.setValue("isActive", checked)}
                                className="scale-75 data-[state=checked]:bg-brand-yellow data-[state=unchecked]:bg-zinc-800"
                            />
                            <Label htmlFor="product-active" className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {form.watch("isActive") ? "Product Live" : "Draft Mode"}
                            </Label>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1 md:flex-none h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 md:flex-none min-w-[140px] h-10 rounded-xl bg-brand-yellow text-black hover:bg-brand-yellow/90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-yellow/10"
                            >
                                {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                {product ? "Update Product" : "Launch Product"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}
