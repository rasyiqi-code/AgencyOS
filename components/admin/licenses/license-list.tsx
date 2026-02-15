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
        <div className="bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead>License Key</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Pembeli</TableHead>
                        <TableHead>Aktivasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Kadaluarsa</TableHead>
                        <TableHead>Dibuat</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {licenses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <Key className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <p>Belum ada lisensi.</p>
                                    <p className="text-xs text-zinc-600 max-w-xs">
                                        Lisensi akan otomatis dibuat saat ada pembelian produk digital, atau bisa di-generate manual.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        licenses.map((license) => (
                            <TableRow key={license.id} className="hover:bg-white/5 border-white/5">
                                {/* License Key + Copy */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-black/30 px-2 py-1 rounded text-xs font-mono text-zinc-300">
                                            {license.key}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(license.key)}
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </TableCell>

                                {/* Produk */}
                                <TableCell>
                                    <div className="font-medium text-sm text-zinc-300">{license.product.name}</div>
                                </TableCell>

                                {/* Pembeli (dari DigitalOrder) */}
                                <TableCell>
                                    {license.digitalOrder ? (
                                        <div>
                                            <div className="text-sm text-zinc-300">{license.digitalOrder.userEmail}</div>
                                            {license.digitalOrder.userName && (
                                                <div className="text-xs text-zinc-500">{license.digitalOrder.userName}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-zinc-600 italic">Manual</span>
                                    )}
                                </TableCell>

                                {/* Aktivasi progress bar */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-full max-w-[80px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${license.activations >= license.maxActivations ? 'bg-amber-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min((license.activations / license.maxActivations) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {license.activations}/{license.maxActivations}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Badge variant={license.status === 'active' ? "default" : "secondary"}>
                                        {license.status}
                                    </Badge>
                                </TableCell>

                                {/* Kadaluarsa */}
                                <TableCell className="text-xs text-muted-foreground">
                                    {license.expiresAt ? format(new Date(license.expiresAt), 'PP') : 'Selamanya'}
                                </TableCell>

                                {/* Tanggal Dibuat */}
                                <TableCell className="text-xs text-muted-foreground">
                                    {format(new Date(license.createdAt), 'PP')}
                                </TableCell>

                                {/* Aksi */}
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/20"
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
    );
}
