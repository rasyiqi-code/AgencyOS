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
import { Pencil, Trash2, Key, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Product } from "@prisma/client";

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

            if (!res.ok) throw new Error("Failed");

            toast.success("Produk berhasil dihapus");
            router.refresh();
        } catch {
            toast.error("Gagal menghapus produk");
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead>Produk</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Purchase</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Lisensi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                Belum ada produk. Buat produk pertama Anda.
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id} className="hover:bg-white/5 border-white/5">
                                {/* Nama + Slug + Thumbnail */}
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {product.image ? (
                                            <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 shrink-0">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                                                <Key className="w-4 h-4 text-zinc-600" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-white">{product.name}</div>
                                            <div className="text-xs text-muted-foreground">{product.slug}</div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Tipe: plugin/template */}
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {product.type}
                                    </Badge>
                                </TableCell>

                                {/* Purchase Type: one_time/subscription */}
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            product.purchaseType === "subscription"
                                                ? "border-purple-500/50 text-purple-400"
                                                : "border-blue-500/50 text-blue-400"
                                        }
                                    >
                                        {product.purchaseType === "subscription"
                                            ? `Subscription / ${product.interval || "?"}`
                                            : "One-time"}
                                    </Badge>
                                </TableCell>

                                {/* Harga */}
                                <TableCell className="text-zinc-300">
                                    ${product.price?.toFixed(2) || "0.00"}
                                </TableCell>

                                {/* Jumlah Lisensi */}
                                <TableCell>
                                    <div className="flex items-center gap-1 text-zinc-400">
                                        <Key className="w-3 h-3" />
                                        {product._count?.licenses || 0}
                                    </div>
                                </TableCell>

                                {/* Status Active/Inactive */}
                                <TableCell>
                                    <Badge variant={product.isActive ? "default" : "secondary"}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>

                                {/* Aksi: Edit, Download, Delete */}
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* Link ke file download jika ada */}
                                        {product.fileUrl && (
                                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                                <a href={product.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4 text-brand-yellow" />
                                                    <span className="sr-only">Download</span>
                                                </a>
                                            </Button>
                                        )}
                                        <ProductForm
                                            product={product}
                                            trigger={
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <Pencil className="w-4 h-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                            }
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/20"
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
    );
}
