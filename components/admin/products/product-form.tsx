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
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Product" : "Create Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Kolom Kiri: Informasi Inti */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input {...form.register("name")} placeholder="e.g. Crediblog Theme" />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Slug</Label>
                                    <Input {...form.register("slug")} placeholder="credibleblog" />
                                    {form.formState.errors.slug && (
                                        <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <select
                                        {...form.register("type")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="plugin">Plugin</option>
                                        <option value="template">Template</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...form.register("price", { valueAsNumber: true })}
                                    />
                                    {form.formState.errors.price && (
                                        <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Purchase Type</Label>
                                    <select
                                        {...form.register("purchaseType")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="one_time">One Time</option>
                                        <option value="subscription">Subscription</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`space-y-2 ${form.watch("purchaseType") !== "subscription" ? "col-span-2" : ""}`}>
                                    <Label>Download URL</Label>
                                    <Input {...form.register("fileUrl")} placeholder="https://..." />
                                </div>
                                {form.watch("purchaseType") === "subscription" && (
                                    <div className="space-y-2">
                                        <Label>Interval</Label>
                                        <select
                                            {...form.register("interval")}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select Interval</option>
                                            <option value="month">Monthly</option>
                                            <option value="year">Yearly</option>
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

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    {...form.register("description")}
                                    className="min-h-[145px] resize-none"
                                    placeholder="Tell us about this product..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="product-active"
                                checked={form.watch("isActive")}
                                onCheckedChange={(checked) => form.setValue("isActive", checked)}
                            />
                            <Label htmlFor="product-active" className="cursor-pointer">Active Status</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="min-w-[120px]">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {product ? "Update Product" : "Create Product"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
