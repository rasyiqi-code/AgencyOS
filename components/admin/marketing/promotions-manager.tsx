"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Globe, Eye, Calendar, ExternalLink, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Promotion {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    ctaText: string | null;
    ctaUrl: string | null;
    couponCode: string | null;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
}

export function PromotionsManager() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        ctaText: "",
        ctaUrl: "",
        couponCode: "",
        isActive: true,
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await fetch("/api/marketing/promotions?admin=true");
            const data = await res.json();
            setPromotions(data);
        } catch {
            toast.error("Gagal memuat data promosi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (promo?: Promotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                title: promo.title,
                description: promo.description || "",
                imageUrl: promo.imageUrl,
                ctaText: promo.ctaText || "",
                ctaUrl: promo.ctaUrl || "",
                couponCode: promo.couponCode || "",
                isActive: promo.isActive,
                startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : "",
                endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : "",
            });
        } else {
            setEditingPromo(null);
            setFormData({
                title: "",
                description: "",
                imageUrl: "",
                ctaText: "",
                ctaUrl: "",
                couponCode: "",
                isActive: true,
                startDate: "",
                endDate: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingPromo ? "PATCH" : "POST";
        const url = editingPromo ? `/api/marketing/promotions/${editingPromo.id}` : "/api/marketing/promotions";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingPromo ? "Promosi diperbarui" : "Promosi dibuat");
                setIsDialogOpen(false);
                fetchPromotions();
            } else {
                toast.error("Terjadi kesalahan");
            }
        } catch {
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus promosi ini?")) return;

        try {
            const res = await fetch(`/api/marketing/promotions/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Promosi dihapus");
                fetchPromotions();
            }
        } catch {
            toast.error("Gagal menghapus");
        }
    };

    const toggleStatus = async (promo: Promotion) => {
        try {
            await fetch(`/api/marketing/promotions/${promo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !promo.isActive }),
            });
            fetchPromotions();
        } catch {
            toast.error("Gagal mengubah status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-6 h-6 text-brand-yellow" />
                        Manajemen Poster Promosi
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Kelola banner dan penawaran spesial di halaman publik.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                        <a href="/promosi" target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            Pratinjau
                        </a>
                    </Button>
                    <Button onClick={() => handleOpenDialog()} className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Promo
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[100px] text-zinc-400">Poster</TableHead>
                            <TableHead className="text-zinc-400">Info Promosi</TableHead>
                            <TableHead className="text-zinc-400">Kupon</TableHead>
                            <TableHead className="text-zinc-400">Periode</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-right text-zinc-400">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-white/5">
                                    <TableCell colSpan={6} className="h-20 animate-pulse bg-white/5" />
                                </TableRow>
                            ))
                        ) : promotions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Belum ada promosi yang dibuat.</p>
                                        <Button 
                                            variant="link" 
                                            className="text-brand-yellow mt-2"
                                            onClick={() => handleOpenDialog()}
                                        >
                                            Buat Promo Sekarang
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            promotions.map((promo) => (
                                <TableRow key={promo.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell>
                                        <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                                            <Image 
                                                src={promo.imageUrl} 
                                                alt={promo.title} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm group-hover:text-brand-yellow transition-colors">{promo.title}</span>
                                            <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-[250px]">{promo.description || "Tidak ada deskripsi"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {promo.couponCode ? (
                                            <Badge variant="outline" className="bg-brand-yellow/5 text-brand-yellow border-brand-yellow/20 font-mono text-[10px] px-2 py-0.5">
                                                {promo.couponCode}
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] text-zinc-600 italic">Tanpa Kupon</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-[11px] text-zinc-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-zinc-600" />
                                                <span>Ends: {promo.endDate ? new Date(promo.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : "∞"}</span>
                                            </div>
                                            {promo.ctaUrl && (
                                                <div className="flex items-center gap-1.5 text-zinc-600 mt-0.5 max-w-[150px] truncate">
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span className="truncate">{promo.ctaUrl}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Switch 
                                                checked={promo.isActive} 
                                                onCheckedChange={() => toggleStatus(promo)}
                                                className="scale-75 data-[state=checked]:bg-brand-yellow"
                                            />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${promo.isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                                {promo.isActive ? 'Active' : 'Off'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10"
                                                onClick={() => handleOpenDialog(promo)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                onClick={() => handleDelete(promo.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{editingPromo ? "Edit Promosi" : "Tambah Promosi Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Judul Promo</Label>
                                <Input 
                                    required 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                    placeholder="Contoh: Diskon Lebaran 50%"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">URL Gambar Poster</Label>
                                <Input 
                                    required 
                                    value={formData.imageUrl} 
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-400">Deskripsi Singkat</Label>
                            <Textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 min-h-[100px] resize-none"
                                placeholder="Jelaskan detail promo..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">CTA Text (Tombol)</Label>
                                <Input 
                                    value={formData.ctaText} 
                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                    placeholder="Lihat Detail / Beli Sekarang"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">CTA URL (Tautan)</Label>
                                <Input 
                                    value={formData.ctaUrl} 
                                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                    placeholder="/products/..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Kode Kupon</Label>
                                <Input 
                                    value={formData.couponCode} 
                                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11 font-mono font-bold"
                                    placeholder="PROMO2024"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Mulai</Label>
                                <Input 
                                    type="datetime-local"
                                    value={formData.startDate} 
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Berakhir</Label>
                                <Input 
                                    type="datetime-local"
                                    value={formData.endDate} 
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/5 border border-white/5">
                            <Switch 
                                checked={formData.isActive} 
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                className="data-[state=checked]:bg-brand-yellow"
                            />
                            <Label className="text-sm font-medium">Aktifkan Promosi Sekarang</Label>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white">Batal</Button>
                            <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold px-8 h-11">
                                {editingPromo ? "Simpan Perubahan" : "Buat Promosi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
