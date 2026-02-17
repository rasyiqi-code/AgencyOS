"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/shared/utils";

interface Coupon {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: Date | null;
    isActive: boolean;
    appliesTo: string[];
    createdAt: Date;
}

export function CouponsManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        maxUses: "",
        expiresAt: "",
        appliesTo: ["DIGITAL", "SERVICE", "CALCULATOR"],
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const response = await fetch('/api/admin/marketing/coupons');
            if (!response.ok) throw new Error("Failed to load");
            const data = await response.json();
            setCoupons(data);
        } catch {
            toast.error("Gagal memuat kupon");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCoupon.code || !newCoupon.discountValue) {
            toast.error("Code and Discount Value are required");
            return;
        }

        try {
            const response = await fetch('/api/admin/marketing/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: newCoupon.code,
                    discountType: newCoupon.discountType,
                    discountValue: parseFloat(newCoupon.discountValue),
                    maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : undefined,
                    expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt) : undefined,
                    appliesTo: newCoupon.appliesTo,
                })
            });

            if (!response.ok) throw new Error("Failed to create");

            toast.success("Kupon berhasil dibuat");
            setNewCoupon({ code: "", discountType: "percentage", discountValue: "", maxUses: "", expiresAt: "", appliesTo: ["DIGITAL", "SERVICE", "CALCULATOR"] });
            loadCoupons();
        } catch {
            toast.error("Gagal membuat kupon");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kupon ini?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/coupons?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("Kupon berhasil dihapus");
            loadCoupons();
        } catch {
            toast.error("Gagal menghapus kupon");
        }
    };

    return (
        <div className="grid gap-4 md:gap-6">
            {/* Create Form */}
            <div className="p-4 md:p-5 rounded-xl border border-white/5 bg-zinc-900/40 space-y-5">
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <h3 className="text-xs md:text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                        <Plus className="w-3.5 h-3.5 text-brand-yellow" />
                        Kupon Baru
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Kode</label>
                        <Input
                            placeholder="WELCOME20"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            className="uppercase h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="lg:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tipe</label>
                        <Select
                            value={newCoupon.discountType}
                            onValueChange={(val) => setNewCoupon({ ...newCoupon, discountType: val })}
                        >
                            <SelectTrigger className="h-9 text-xs font-bold bg-black/50 border-white/10">
                                <SelectValue placeholder="Tipe" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10">
                                <SelectItem value="percentage">Persentase (%)</SelectItem>
                                <SelectItem value="fixed">Tetap ($)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="lg:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nilai</label>
                        <Input
                            type="number"
                            placeholder="Nilai"
                            value={newCoupon.discountValue}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                            className="h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="lg:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Batas Pakai</label>
                        <Input
                            type="number"
                            placeholder="∞"
                            value={newCoupon.maxUses}
                            onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                            className="h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="lg:col-span-3 space-y-1.5 flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tanggal Kadaluarsa</label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={newCoupon.expiresAt}
                                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                className="h-9 text-xs font-bold bg-black/50 border-white/10 flex-1"
                            />
                            <Button
                                onClick={handleCreate}
                                className="bg-brand-yellow text-black hover:bg-white transition-all h-9 text-[11px] font-black uppercase tracking-widest px-4 shadow-lg shadow-brand-yellow/10"
                            >
                                Buat
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scoping badges */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-zinc-500 mr-1 self-center uppercase font-bold tracking-wider">Berlaku Untuk:</span>
                    {["DIGITAL", "SERVICE", "CALCULATOR"].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                const current = newCoupon.appliesTo;
                                const updated = current.includes(type)
                                    ? current.filter(t => t !== type)
                                    : [...current, type];
                                setNewCoupon({ ...newCoupon, appliesTo: updated });
                            }}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black transition-colors ${newCoupon.appliesTo.includes(type)
                                ? "bg-brand-yellow text-black"
                                : "bg-zinc-800 text-zinc-500 hover:text-zinc-400"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden overflow-x-auto custom-scrollbar">
                {/* Desktop view */}
                <div className="hidden md:block">
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs h-10">Kode</TableHead>
                                <TableHead className="text-xs h-10">Diskon</TableHead>
                                <TableHead className="text-xs h-10">Penggunaan</TableHead>
                                <TableHead className="text-xs h-10">Cakupan</TableHead>
                                <TableHead className="text-xs h-10">Kadaluarsa</TableHead>
                                <TableHead className="text-xs h-10">Status</TableHead>
                                <TableHead className="text-right text-xs h-10">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">Memuat...</TableCell>
                                </TableRow>
                            ) : coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">Kupon tidak ditemukan.</TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.id} className="border-white/5">
                                        <TableCell className="font-mono font-medium text-white text-sm">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-3 h-3 text-brand-yellow" />
                                                {coupon.code}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-[11px]">
                                                <span className="text-zinc-300">{coupon.usedCount} terpakai</span>
                                                {coupon.maxUses && <span className="text-zinc-600">dari {coupon.maxUses} maks</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {coupon.appliesTo?.map(t => (
                                                    <Badge key={t} variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-zinc-800 text-zinc-500 font-bold">
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 text-xs italic">
                                            {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM dd, yyyy') : 'Tanpa Kadaluarsa'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] px-2 py-0 h-5 font-bold",
                                                coupon.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-600 border-white/10"
                                            )}>
                                                {coupon.isActive ? "AKTIF" : "NONAKTIF"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile view */}
                <div className="block md:hidden divide-y divide-white/5">
                    {isLoading ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">Memuat...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">Kupon tidak ditemukan.</div>
                    ) : (
                        coupons.map((coupon) => (
                            <div key={coupon.id} className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-brand-yellow" />
                                        <span className="font-mono font-bold text-white text-sm uppercase">{coupon.code}</span>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "text-[9px] px-1.5 py-0 h-4 font-black",
                                        coupon.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-600 border-white/10"
                                    )}>
                                        {coupon.isActive ? "AKTIF" : "NONAKTIF"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-300">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} DISKON
                                    </span>
                                    <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                                        <span>{coupon.usedCount} terpakai</span>
                                        {coupon.maxUses && <span>/ {coupon.maxUses} maks</span>}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {coupon.appliesTo?.map(t => (
                                        <Badge key={t} variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-zinc-800 text-zinc-500">
                                            {t}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-[10px] text-zinc-600 italic">
                                        {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM dd, yyyy') : 'Tanpa Kadaluarsa'}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-zinc-600 hover:text-red-400"
                                        onClick={() => handleDelete(coupon.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
