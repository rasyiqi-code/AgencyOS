"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "./product-form";
import { Pencil, Trash2, Key, ExternalLink, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Product } from "@prisma/client";
import { cn } from "@/lib/shared/utils";

type ProductWithCount = Product & { _count?: { licenses: number } };

/**
 * Props untuk ProductList component.
 * Menggunakan `any` karena Prisma type cache mungkin belum mengenali
 * field baru (purchaseType, interval, image, fileUrl).
 */
interface ProductListProps {
    products: ProductWithCount[];
}

export function ProductList({ products }: ProductListProps) {
    const router = useRouter();

    /** Hapus produk via API */
    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus produk ini? Aksi ini tidak bisa dibatalkan.")) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to delete product");
            }

            toast.success("Produk berhasil dihapus");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus produk");
        }
    };

    return (
        <div className="space-y-4">
            {/* Mobile Card View (Visible only on mobile/small screens) */}
            <div className="block lg:hidden space-y-3">
                {products.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/10">
                        <Package className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No products found</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="p-3 md:p-4 rounded-2xl border border-white/5 bg-zinc-900/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {product.image ? (
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={40}
                                                height={40}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10">
                                            <Package className="w-4 h-4 text-zinc-600" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="font-black text-white text-[11px] truncate uppercase tracking-tight">{product.name}</div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 uppercase font-black tracking-tighter opacity-70">
                                                {product.type}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[7px] h-3.5 px-1.5 uppercase font-black tracking-tighter",
                                                    product.purchaseType === "subscription"
                                                        ? "border-purple-500/30 text-purple-400 bg-purple-500/5"
                                                        : "border-blue-500/30 text-blue-400 bg-blue-500/5"
                                                )}
                                            >
                                                {product.purchaseType === "subscription" ? "Sub" : "One-time"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-black text-brand-yellow tracking-tighter">${product.price?.toFixed(2) || "0.00"}</div>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <div className={`w-1 h-1 rounded-full ${product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-600"}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${product.isActive ? "text-green-500" : "text-zinc-600"}`}>
                                            {product.isActive ? "Live" : "Draft"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-zinc-600 text-[8px] font-black uppercase tracking-widest">
                                        <Key className="w-2.5 h-2.5 opacity-50" />
                                        {product._count?.licenses || 0} Lisensi
                                    </div>
                                    {product.fileUrl && (
                                        <a
                                            href={product.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-zinc-600 hover:text-brand-yellow text-[8px] font-black uppercase tracking-widest transition-colors"
                                        >
                                            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                            File
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ProductForm
                                        product={product}
                                        trigger={
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg border border-white/5">
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                        }
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-white/5"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Section (Visible only on desktop) */}
            <div className="hidden lg:block relative group overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
                <Table className="min-w-[900px]">
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 pl-6">Informasi Produk</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3">Tipe</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Harga</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Lisensi</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-right pr-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Package className="w-10 h-10 text-zinc-800" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Produk tidak ditemukan</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group/row">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            {product.image ? (
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 group-hover/row:border-brand-yellow/30 transition-colors">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 shrink-0 group-hover/row:border-brand-yellow/30 transition-colors">
                                                    <Package className="w-5 h-5 text-zinc-700" />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <div className="font-black text-white text-sm uppercase tracking-tight">{product.name}</div>
                                                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">SLUG: {product.slug}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-widest h-5 px-2 bg-zinc-950/50 border-white/5">
                                                {product.type}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "w-fit text-[8px] font-black uppercase tracking-widest h-5 px-2",
                                                    product.purchaseType === "subscription"
                                                        ? "border-purple-500/30 text-purple-400 bg-purple-500/5"
                                                        : "border-blue-500/30 text-blue-400 bg-blue-500/5"
                                                )}
                                            >
                                                {product.purchaseType === "subscription"
                                                    ? `LANGGANAN / ${product.interval || "?"}`
                                                    : "PEMBELIAN SEKALI"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="font-black text-brand-yellow text-sm tracking-tighter">${product.price?.toFixed(2) || "0.00"}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                            <Key className="w-3 h-3 text-zinc-600" />
                                            {product._count?.licenses || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-700"}`} />
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${product.isActive ? "text-green-500" : "text-zinc-600"}`}>
                                                {product.isActive ? "Aktif" : "Draft"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {product.fileUrl && (
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-500 hover:text-brand-yellow hover:bg-brand-yellow/10 rounded-xl" asChild>
                                                    <a href={product.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span className="sr-only">Download</span>
                                                    </a>
                                                </Button>
                                            )}
                                            <ProductForm
                                                product={product}
                                                trigger={
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl border border-white/5">
                                                        <Pencil className="w-4 h-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl border border-white/5"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
