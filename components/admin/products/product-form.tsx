"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { ProductImageUpload } from "./product-image-upload";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    type: z.enum(["plugin", "template"]),
    isActive: z.boolean().default(true),
    purchaseType: z.enum(["one_time", "subscription"]).default("one_time"),
    interval: z.string().optional(),
    fileUrl: z.string().optional(),
    image: z.string().optional(),
});

interface ProductFormValues {
    name: string;
    slug: string;
    description?: string;
    price: number;
    type: "plugin" | "template";
    isActive?: boolean;
    purchaseType?: "one_time" | "subscription";
    interval?: string;
    fileUrl?: string;
    image?: string;
}

interface ProductFormProps {
    product?: Product;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function ProductForm({ product, trigger, onSuccess }: ProductFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name || "",
            slug: product?.slug || "",
            description: product?.description || "",
            price: product?.price ? Number(product.price) : 0,
            type: (product?.type as "plugin" | "template") || "plugin",
            isActive: product?.isActive ?? true,
            purchaseType: (product?.purchaseType as "one_time" | "subscription") || "one_time",
            interval: product?.interval || "",
            fileUrl: product?.fileUrl || "",
            image: product?.image || "",
        },
    });

    const onSubmit = async (data: ProductFormValues) => {
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
                    <Button className="h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 md:px-5 bg-brand-yellow text-black hover:bg-brand-yellow/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-zinc-950 border-white/5 p-4 md:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tighter text-white">
                        {product ? "Edit Product" : "Create Product"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Kolom Kiri: Informasi Inti */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Name</Label>
                                <Input
                                    {...form.register("name")}
                                    placeholder="e.g. Crediblog Theme"
                                    className="bg-black/50 border-white/5 rounded-xl h-10 text-xs focus:border-brand-yellow/30 transition-colors"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Slug</Label>
                                    <Input
                                        {...form.register("slug")}
                                        placeholder="credibleblog"
                                        className="bg-black/50 border-white/5 rounded-xl h-10 text-xs focus:border-brand-yellow/30 transition-colors"
                                    />
                                    {form.formState.errors.slug && (
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{form.formState.errors.slug.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</Label>
                                    <select
                                        {...form.register("type")}
                                        className="flex h-10 w-full rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow/30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                                    >
                                        <option value="plugin" className="bg-zinc-900">Plugin</option>
                                        <option value="template" className="bg-zinc-900">Template</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...form.register("price", { valueAsNumber: true })}
                                        className="bg-black/50 border-white/5 rounded-xl h-10 text-xs focus:border-brand-yellow/30 transition-colors"
                                    />
                                    {form.formState.errors.price && (
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{form.formState.errors.price.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Purchase Type</Label>
                                    <select
                                        {...form.register("purchaseType")}
                                        className="flex h-10 w-full rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow/30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                                    >
                                        <option value="one_time" className="bg-zinc-900">One Time</option>
                                        <option value="subscription" className="bg-zinc-900">Subscription</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Download URL</Label>
                                    <Input
                                        {...form.register("fileUrl")}
                                        placeholder="https://..."
                                        className="bg-black/50 border-white/5 rounded-xl h-10 text-xs focus:border-brand-yellow/30 transition-colors"
                                    />
                                </div>
                                {form.watch("purchaseType") === "subscription" && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Interval</Label>
                                        <select
                                            {...form.register("interval")}
                                            className="flex h-10 w-full rounded-xl border border-white/5 bg-black/50 px-3 py-2 text-xs appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-zinc-900">Select Interval</option>
                                            <option value="month" className="bg-zinc-900">Monthly</option>
                                            <option value="year" className="bg-zinc-900">Yearly</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kolom Kanan: Media & Deskripsi */}
                        <div className="space-y-4">
                            <ProductImageUpload
                                value={form.watch("image")}
                                onChange={(url) => form.setValue("image", url)}
                                onRemove={() => form.setValue("image", "")}
                            />

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</Label>
                                <Textarea
                                    {...form.register("description")}
                                    className="min-h-[145px] bg-black/50 border-white/5 rounded-2xl text-xs resize-none focus:border-brand-yellow/30 transition-colors"
                                    placeholder="Tell us about this product..."
                                />
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
        </Dialog>
    );
}
