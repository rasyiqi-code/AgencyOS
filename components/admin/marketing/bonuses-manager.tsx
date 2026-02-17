"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface Bonus {
    id: string;
    title: string;
    description: string | null;
    value: string | null;
    icon: string | null;
    isActive: boolean;
    appliesTo: string[];
    createdAt: Date;
}

export function BonusesManager() {
    const [bonuses, setBonuses] = useState<Bonus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBonus, setNewBonus] = useState({
        title: "",
        description: "",
        value: "",
        icon: "CheckCircle2",
        appliesTo: ["DIGITAL", "SERVICE", "CALCULATOR"],
    });

    useEffect(() => {
        loadBonuses();
    }, []);

    const loadBonuses = async () => {
        try {
            const response = await fetch('/api/admin/marketing/bonuses');
            if (!response.ok) throw new Error("Failed to load");
            const data = await response.json();
            setBonuses(data);
        } catch {
            toast.error("Gagal memuat bonus");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newBonus.title) {
            toast.error("Title is required");
            return;
        }

        try {
            const response = await fetch('/api/admin/marketing/bonuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newBonus.title,
                    description: newBonus.description || undefined,
                    value: newBonus.value || undefined,
                    icon: newBonus.icon || undefined,
                    appliesTo: newBonus.appliesTo,
                })
            });

            if (!response.ok) throw new Error("Failed to create");

            toast.success("Bonus berhasil dibuat");
            setNewBonus({ title: "", description: "", value: "", icon: "CheckCircle2", appliesTo: ["DIGITAL", "SERVICE", "CALCULATOR"] });
            loadBonuses();
        } catch {
            toast.error("Gagal membuat bonus");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus bonus ini?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/bonuses?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("Bonus berhasil dihapus");
            loadBonuses();
        } catch {
            toast.error("Gagal menghapus bonus");
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/admin/marketing/bonuses', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !currentStatus })
            });
            if (!response.ok) throw new Error("Failed to update");

            loadBonuses();
        } catch {
            toast.error("Gagal memperbarui status");
        }
    };

    return (
        <div className="grid gap-4 md:gap-6">
            {/* Create Form */}
            <div className="p-4 md:p-5 rounded-xl border border-white/5 bg-zinc-900/40 space-y-5">
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <h3 className="text-xs md:text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                        <Plus className="w-3.5 h-3.5 text-brand-yellow" />
                        Tambah Bonus Baru
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Judul</label>
                        <Input
                            placeholder="Misal: Maintenance Server 1 Tahun"
                            value={newBonus.title}
                            onChange={(e) => setNewBonus({ ...newBonus, title: e.target.value })}
                            className="h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="lg:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nilai Bonus</label>
                        <Input
                            placeholder="Misal: Senilai $500"
                            value={newBonus.value}
                            onChange={(e) => setNewBonus({ ...newBonus, value: e.target.value })}
                            className="h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="lg:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nama Ikon</label>
                        <Input
                            placeholder="Misal: Gift"
                            value={newBonus.icon}
                            onChange={(e) => setNewBonus({ ...newBonus, icon: e.target.value })}
                            className="h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="lg:col-span-3 space-y-1.5 flex flex-col justify-end">
                        <Button
                            onClick={handleCreate}
                            className="bg-brand-yellow text-black hover:bg-white transition-all h-9 text-[11px] font-black uppercase tracking-widest w-full shadow-lg shadow-brand-yellow/10"
                        >
                            Tambah Bonus
                        </Button>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-12 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Deskripsi (Opsional)</label>
                        <Input
                            placeholder="Jelaskan secara singkat apa yang termasuk dalam bonus ini..."
                            value={newBonus.description}
                            onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                            className="h-9 text-xs font-bold bg-black/50 border-white/10"
                        />
                    </div>
                </div>

                {/* Scoping badges */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-zinc-500 mr-1 self-center uppercase font-bold tracking-wider">Berlaku Untuk:</span>
                    {["DIGITAL", "SERVICE", "CALCULATOR"].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                const current = newBonus.appliesTo;
                                const updated = current.includes(type)
                                    ? current.filter(t => t !== type)
                                    : [...current, type];
                                setNewBonus({ ...newBonus, appliesTo: updated });
                            }}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black transition-colors ${newBonus.appliesTo.includes(type)
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
                    <Table className="min-w-[600px]">
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs h-10 w-[80px]">Aktif</TableHead>
                                <TableHead className="text-xs h-10 w-[60px]">Ikon</TableHead>
                                <TableHead className="text-xs h-10">Detail</TableHead>
                                <TableHead className="text-xs h-10">Nilai</TableHead>
                                <TableHead className="text-xs h-10">Cakupan</TableHead>
                                <TableHead className="text-right text-xs h-10">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Memuat...</TableCell>
                                </TableRow>
                            ) : bonuses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Bonus tidak ditemukan.</TableCell>
                                </TableRow>
                            ) : (
                                bonuses.map((bonus) => {
                                    // Dynamic access to Lucide icons
                                    const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[bonus.icon || 'Gift'] || Gift;

                                    return (
                                        <TableRow key={bonus.id} className="border-white/5">
                                            <TableCell>
                                                <Switch
                                                    checked={bonus.isActive}
                                                    onCheckedChange={() => handleToggle(bonus.id, bonus.isActive)}
                                                    className="scale-75 origin-left"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                                                    <IconComponent className="w-3.5 h-3.5" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white text-sm">{bonus.title}</span>
                                                    {bonus.description && <span className="text-[11px] text-zinc-500 line-clamp-1">{bonus.description}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-brand-yellow text-xs font-bold">
                                                {bonus.value || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {bonus.appliesTo?.map(t => (
                                                        <Badge key={t} variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-zinc-800 text-zinc-500 font-bold">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => handleDelete(bonus.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile view */}
                <div className="block md:hidden divide-y divide-white/5">
                    {isLoading ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">Memuat...</div>
                    ) : bonuses.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">Bonus tidak ditemukan.</div>
                    ) : (
                        bonuses.map((bonus) => {
                            const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[bonus.icon || 'Gift'] || Gift;
                            return (
                                <div key={bonus.id} className="p-3 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 shrink-0">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white text-sm leading-tight">{bonus.title}</div>
                                                <div className="text-brand-yellow text-[11px] font-black uppercase mt-0.5">{bonus.value || "BONUS EKSKLUSIF"}</div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={bonus.isActive}
                                            onCheckedChange={() => handleToggle(bonus.id, bonus.isActive)}
                                            className="scale-75 origin-right"
                                        />
                                    </div>

                                    {bonus.description && (
                                        <p className="text-[11px] text-zinc-500 leading-relaxed italic line-clamp-2">
                                            {bonus.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center pt-1">
                                        <div className="flex flex-wrap gap-1">
                                            {bonus.appliesTo?.map(t => (
                                                <Badge key={t} variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-zinc-800 text-zinc-600">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-zinc-600 hover:text-red-400"
                                            onClick={() => handleDelete(bonus.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
