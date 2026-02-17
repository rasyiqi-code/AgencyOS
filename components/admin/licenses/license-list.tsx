"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";

/**
 * Tipe License dengan relasi Product dan DigitalOrder.
 * Menggunakan any untuk field dari model baru yang mungkin belum dikenali TS server.
 */
interface LicenseWithRelations {
    id: string;
    key: string;
    status: string;
    activations: number;
    maxActivations: number;
    expiresAt: Date | null;
    createdAt: Date;
    userId: string | null;
    product: { name: string; slug: string };
    digitalOrder?: {
        userEmail: string;
        userName: string | null;
        status: string;
    } | null;
}

interface LicenseListProps {
    licenses: LicenseWithRelations[];
}

export function LicenseList({ licenses }: LicenseListProps) {
    const router = useRouter();

    /** Copy license key ke clipboard */
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin ke clipboard");
    };

    /** Hapus license via API */
    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus lisensi ini?")) return;

        try {
            const res = await fetch(`/api/admin/licenses/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal menghapus lisensi");
            }

            toast.success("Lisensi berhasil dihapus");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus lisensi");
        }
    };

    return (
        <div className="space-y-4">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
                {licenses.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/10">
                        <Key className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No licenses found</p>
                    </div>
                ) : (
                    licenses.map((license) => (
                        <div key={license.id} className="p-3 md:p-4 rounded-2xl border border-white/5 bg-zinc-900/30 space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <code className="bg-black/40 px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-400 border border-white/5">
                                            {license.key}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(license.key)}
                                            className="text-zinc-500 hover:text-brand-yellow transition-colors"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="font-black text-white text-[11px] uppercase tracking-tight truncate">
                                        {license.product.name}
                                    </div>
                                    <div className="mt-0.5">
                                        {license.digitalOrder ? (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-500 font-bold truncate uppercase tracking-tight">
                                                    {license.digitalOrder.userEmail}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Manual Issue</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[8px] h-4 px-2 uppercase font-black tracking-widest border-white/5",
                                            license.status === 'active' ? "text-green-500 bg-green-500/5" : "text-zinc-500 bg-zinc-500/5"
                                        )}
                                    >
                                        {license.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
                                    <span>Activation Progress</span>
                                    <span>{license.activations}/{license.maxActivations}</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            license.activations >= license.maxActivations ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                                        )}
                                        style={{ width: `${Math.min((license.activations / license.maxActivations) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
                                    Issued {format(new Date(license.createdAt), 'PP')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-white/5"
                                        onClick={() => handleDelete(license.id)}
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

            {/* Desktop Table */}
            <div className="hidden lg:block relative group overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
                <Table className="min-w-[1000px]">
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 pl-6">Kunci & Produk</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3">Pembeli</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Aktivasi</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Kadaluarsa</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Dibuat</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-right pr-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {licenses.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Key className="w-10 h-10 text-zinc-800" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Belum ada lisensi dalam katalog</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            licenses.map((license) => (
                                <TableRow key={license.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group/row">
                                    <TableCell className="py-4 pl-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-black/30 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 border border-white/5 group-hover/row:border-brand-yellow/30 transition-colors">
                                                    {license.key}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(license.key)}
                                                    className="text-zinc-600 hover:text-brand-yellow transition-colors"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="font-black text-white text-[11px] uppercase tracking-tight">{license.product.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {license.digitalOrder ? (
                                            <div className="space-y-0.5">
                                                <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-tight">{license.digitalOrder.userEmail}</div>
                                                {license.digitalOrder.userName && (
                                                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{license.digitalOrder.userName}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-50 border-white/5">Manual</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-20 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={cn(
                                                        "h-full",
                                                        license.activations >= license.maxActivations ? 'bg-amber-500' : 'bg-green-500'
                                                    )}
                                                    style={{ width: `${Math.min((license.activations / license.maxActivations) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                                {license.activations} / {license.maxActivations} slots
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                license.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-700"
                                            )} />
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest",
                                                license.status === 'active' ? "text-green-500" : "text-zinc-600"
                                            )}>
                                                {license.status === 'active' ? 'Aktif' : license.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tight">
                                            {license.expiresAt ? format(new Date(license.expiresAt), 'PP') : 'Selamanya'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tight">
                                            {format(new Date(license.createdAt), 'PP')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                                            onClick={() => handleDelete(license.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
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
