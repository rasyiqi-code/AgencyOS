"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { 
    Plus, Edit3, Trash2, X, Loader2, Package, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    createSoftwareProduct, updateSoftwareProduct, deleteSoftwareProduct 
} from "@/app/actions/software-products";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface ProductClientProps {
    initialProducts: any[];
}

export function ProductClient({ initialProducts }: ProductClientProps) {
    const [products, setProducts] = useState(initialProducts);
    const [isPending, startTransition] = useTransition();

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refreshData = async () => {
        // Fetch fresh data via API or trigger server-side revalidation
        const res = await fetch("/api/public/agency-info"); // fallback dummy to refresh NextJS route cache
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus produk ini? Semua lisensi yang terkait dengan produk ini juga akan terhapus.")) return;
        
        startTransition(async () => {
            const res = await deleteSoftwareProduct(id);
            if (res.success) {
                toast.success("Produk berhasil dihapus");
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                toast.error(res.error || "Gagal menghapus produk");
            }
        });
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        
        let res;
        if (editingProduct) {
            res = await updateSoftwareProduct(editingProduct.id, formData);
        } else {
            res = await createSoftwareProduct(formData);
        }

        setIsSubmitting(false);

        if (res.success) {
            toast.success(editingProduct ? "Produk berhasil diperbarui" : "Produk baru berhasil didaftarkan");
            setIsOpen(false);
            setEditingProduct(null);
            refreshData();
        } else {
            toast.error(res.error || "Terjadi kesalahan");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="w-6 h-6 text-blue-500 animate-pulse" />
                        Katalog Produk Jadi
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Daftarkan software, plugin, atau tema Anda agar bisa dilisensikan dan dibeli oleh klien.
                    </p>
                </div>
                <Button 
                    onClick={() => {
                        setEditingProduct(null);
                        setIsOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-lg shadow-blue-500/10 transition-transform active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Produk Baru
                </Button>
            </div>

            {/* List Table */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/20 backdrop-blur-md overflow-hidden relative">
                {isPending && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-zinc-300 text-sm">
                        <thead className="bg-zinc-900/60 border-b border-white/5 text-zinc-400 font-semibold">
                            <tr>
                                <th className="p-4">Nama Produk / Slug</th>
                                <th className="p-4">Deskripsi</th>
                                <th className="p-4">Harga / Billing</th>
                                <th className="p-4 text-center">Batas Aktivasi</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-zinc-500">
                                        Belum ada produk software yang didaftarkan.
                                    </td>
                                </tr>
                            ) : (
                                products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-white text-base">
                                                {prod.name}
                                            </div>
                                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 select-all">
                                                slug: {prod.slug}
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-400 max-w-xs truncate text-xs">
                                            {prod.description || "-"}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white text-sm">
                                                <PriceDisplay amount={prod.price} />
                                            </div>
                                            <div className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider font-semibold">
                                                {prod.interval === "one_time" ? "Sekali Bayar" : prod.interval}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-semibold text-zinc-200">
                                            {prod.maxActivations} Domain
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                prod.isActive 
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                    : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                                            }`}>
                                                {prod.isActive ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-zinc-400 hover:text-white"
                                                    onClick={() => {
                                                        setEditingProduct(prod);
                                                        setIsOpen(true);
                                                    }}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                                                    onClick={() => handleDelete(prod.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-zinc-900 border border-white/5 rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                            <h3 className="font-semibold text-white text-base">
                                {editingProduct ? "Edit Detail Produk" : "Daftarkan Produk Baru"}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    setEditingProduct(null);
                                }} 
                                className="text-zinc-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Produk Software / Plugin / Tema</label>
                                <Input 
                                    name="name" 
                                    placeholder="Contoh: Imperium WordPress Plugin Pro" 
                                    defaultValue={editingProduct?.name || ""}
                                    required 
                                    className="bg-black/40 border-white/10 text-zinc-200" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deskripsi Singkat</label>
                                <Textarea 
                                    name="description" 
                                    placeholder="Detail kegunaan produk..." 
                                    defaultValue={editingProduct?.description || ""}
                                    className="bg-black/40 border-white/10 text-zinc-200 min-h-[80px]" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Harga Lisensi</label>
                                    <Input 
                                        name="price" 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="0.00" 
                                        defaultValue={editingProduct?.price || ""}
                                        required 
                                        className="bg-black/40 border-white/10 text-zinc-200 font-semibold" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mata Uang</label>
                                    <select 
                                        name="currency" 
                                        defaultValue={editingProduct?.currency || "USD"}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg text-zinc-300 text-sm px-3 py-2 outline-none focus:border-blue-500/40 h-10"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="IDR">IDR (Rp)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Batas Aktivasi Domain</label>
                                    <Input 
                                        name="maxActivations" 
                                        type="number" 
                                        min="1" 
                                        defaultValue={editingProduct?.maxActivations || 1} 
                                        required 
                                        className="bg-black/40 border-white/10 text-zinc-200" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Metode Tagihan</label>
                                    <select 
                                        name="interval" 
                                        defaultValue={editingProduct?.interval || "one_time"}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg text-zinc-300 text-sm px-3 py-2 outline-none focus:border-blue-500/40 h-10"
                                    >
                                        <option value="one_time">Sekali Bayar (Lifetime)</option>
                                        <option value="monthly">Bulanan (Monthly)</option>
                                        <option value="yearly">Tahunan (Yearly)</option>
                                    </select>
                                </div>
                            </div>

                            {editingProduct && (
                                <div className="flex items-center gap-2 pt-2">
                                    <input 
                                        type="checkbox" 
                                        name="isActive_checkbox" 
                                        id="isActive_checkbox"
                                        defaultChecked={editingProduct.isActive}
                                        onChange={(e) => {
                                            const input = document.getElementById("isActive_hidden") as HTMLInputElement;
                                            if (input) input.value = e.target.checked ? "true" : "false";
                                        }}
                                        className="h-4 w-4 rounded border-white/10 bg-black/20 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive_checkbox" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider cursor-pointer">
                                        Produk Aktif / Dijual
                                    </label>
                                    <input type="hidden" name="isActive" id="isActive_hidden" value={editingProduct.isActive ? "true" : "false"} />
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => {
                                        setIsOpen(false);
                                        setEditingProduct(null);
                                    }}
                                    className="flex-1 text-zinc-400 hover:text-white"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                                >
                                    {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
