"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { 
    Search, Plus, RotateCw, Ban, Trash2, Loader2, Key, X, Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    getLicenses, createManualLicense, toggleLicenseStatus, regenerateLicenseKey, deleteLicense 
} from "@/app/actions/licenses";

interface LicenseClientProps {
    initialProducts: { id: string; name: string }[];
}

export function LicenseClient({ initialProducts }: LicenseClientProps) {
    const [licenses, setLicenses] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [isPending, startTransition] = useTransition();

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLicenses = () => {
        startTransition(async () => {
            try {
                const res = await getLicenses({ page, limit: 10, search, status });
                setLicenses(res.licenses);
                setTotal(res.total);
                setTotalPages(res.totalPages);
            } catch (err) {
                toast.error("Gagal mengambil data lisensi.");
            }
        });
    };

    useEffect(() => {
        fetchLicenses();
    }, [page, search, status]);

    const handleToggleStatus = async (id: string) => {
        const res = await toggleLicenseStatus(id);
        if (res.success) {
            toast.success(`Status lisensi berhasil diubah menjadi: ${res.status}`);
            fetchLicenses();
        } else {
            toast.error(res.error || "Gagal mengubah status lisensi.");
        }
    };

    const handleRegenerate = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin me-regenerasi kunci lisensi ini? Kunci lama tidak akan bisa digunakan lagi.")) return;
        const res = await regenerateLicenseKey(id);
        if (res.success) {
            toast.success("Kunci lisensi berhasil diperbarui.");
            fetchLicenses();
        } else {
            toast.error(res.error || "Gagal memperbarui kunci lisensi.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus lisensi ini secara permanen? Semua data aktivasi juga akan terhapus.")) return;
        const res = await deleteLicense(id);
        if (res.success) {
            toast.success("Lisensi berhasil dihapus.");
            fetchLicenses();
        } else {
            toast.error(res.error || "Gagal menghapus lisensi.");
        }
    };

    const handleCreateLicense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const res = await createManualLicense(formData);
        setIsSubmitting(false);

        if (res.success) {
            toast.success("Lisensi manual berhasil dibuat.");
            setIsCreateModalOpen(false);
            fetchLicenses();
        } else {
            toast.error(res.error || "Gagal membuat lisensi.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Key className="w-6 h-6 text-yellow-500 animate-pulse" />
                        Manajemen Lisensi Klien
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Buat, pantau, dan kelola lisensi aktivasi domain produk software Anda.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Buat Lisensi Manual
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <Input 
                        placeholder="Cari kunci, User ID, nama produk..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 bg-zinc-900/40 border-white/5 text-zinc-200 focus-visible:ring-yellow-500/20"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="bg-zinc-900/40 border border-white/5 rounded-lg text-zinc-300 text-sm px-3 py-2 outline-none focus:border-yellow-500/40"
                >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="SUSPENDED">Ditangguhkan</option>
                    <option value="EXPIRED">Kedaluwarsa</option>
                </select>
            </div>

            {/* List Table */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/20 backdrop-blur-md overflow-hidden min-h-[300px] relative">
                {isPending && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-zinc-300 text-sm">
                        <thead className="bg-zinc-900/60 border-b border-white/5 text-zinc-400 font-semibold">
                            <tr>
                                <th className="p-4">Kunci Lisensi / Detail</th>
                                <th className="p-4">Pemilik Klien</th>
                                <th className="p-4 text-center">Aktivasi</th>
                                <th className="p-4">Masa Aktif</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {licenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-zinc-500">
                                        Tidak ada data lisensi yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                licenses.map((lic) => {
                                    const isExpired = lic.expiresAt && new Date(lic.expiresAt) < new Date();
                                    return (
                                        <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="font-mono text-yellow-400/90 font-semibold select-all text-xs tracking-wider">
                                                    {lic.key}
                                                </div>
                                                {lic.product && (
                                                    <div className="text-[10px] text-zinc-500 mt-1 uppercase font-medium">
                                                        Produk: {lic.product.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-xs font-semibold text-zinc-300">
                                                User ID: {lic.userId}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-semibold text-zinc-200">{lic.activations.length} / {lic.maxActivations}</span>
                                                    {lic.activations.length > 0 && (
                                                        <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-[150px]">
                                                            {lic.activations.map((act: any) => (
                                                                <span key={act.id} className="inline-flex items-center gap-0.5 text-[8px] bg-zinc-800 border border-white/5 text-zinc-400 px-1 py-0.5 rounded">
                                                                    <Globe className="w-2 h-2 text-zinc-500" />
                                                                    {act.domain}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs">
                                                {lic.expiresAt ? (
                                                    <span className={isExpired ? "text-red-400 font-medium" : "text-zinc-400"}>
                                                        {new Date(lic.expiresAt).toLocaleDateString("id-ID", {
                                                            year: "numeric", month: "short", day: "numeric"
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-500 italic">Selamanya (Lifetime)</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    lic.status === "active" 
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                        : lic.status === "suspended"
                                                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {lic.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-zinc-400 hover:text-white"
                                                        title={lic.status === "active" ? "Tangguhkan Lisensi" : "Aktifkan Lisensi"}
                                                        onClick={() => handleToggleStatus(lic.id)}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-zinc-400 hover:text-white"
                                                        title="Regenerasi Kunci"
                                                        onClick={() => handleRegenerate(lic.id)}
                                                    >
                                                        <RotateCw className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                                                        title="Hapus Lisensi"
                                                        onClick={() => handleDelete(lic.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/5 bg-zinc-900/20">
                        <span className="text-xs text-zinc-500">Total {total} lisensi</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm" className="bg-black/20 border-white/10 text-zinc-300"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline" size="sm" className="bg-black/20 border-white/10 text-zinc-300"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Manual Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-zinc-900 border border-white/5 rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                            <h3 className="font-semibold text-white text-base">Buat Lisensi Manual</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLicense} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">User ID Penerima</label>
                                <Input name="userId" placeholder="clerk_user_id_xxx" required className="bg-black/40 border-white/10 text-zinc-200" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pilih Produk Software</label>
                                <select 
                                    name="productId" 
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg text-zinc-300 text-sm px-3 py-2 outline-none focus:border-yellow-500/40 h-10"
                                >
                                    <option value="">-- Pilih Produk Jadi --</option>
                                    {initialProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Batas Aktivasi</label>
                                    <Input name="maxActivations" type="number" min="1" defaultValue="1" className="bg-black/40 border-white/10 text-zinc-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kedaluwarsa (Opsional)</label>
                                    <Input name="expiresAt" type="date" className="bg-black/40 border-white/10 text-zinc-200" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button 
                                    type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 text-zinc-400 hover:text-white"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" disabled={isSubmitting}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                                >
                                    {isSubmitting ? "Membuat..." : "Simpan Lisensi"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
