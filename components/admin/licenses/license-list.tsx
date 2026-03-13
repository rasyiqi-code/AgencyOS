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
import { Copy, Key, Trash2, Box } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin ke clipboard");
    };

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

    // Group licenses by product name
    const groupedLicenses = licenses.reduce((acc, license) => {
        const productName = license.product.name;
        if (!acc[productName]) {
            acc[productName] = [];
        }
        acc[productName].push(license);
        return acc;
    }, {} as Record<string, LicenseWithRelations[]>);

    const productNames = Object.keys(groupedLicenses).sort();

    if (licenses.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/10">
                <Key className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No licenses found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Accordion type="multiple" defaultValue={productNames} className="space-y-4">
                {productNames.map((productName) => (
                    <AccordionItem
                        key={productName}
                        value={productName}
                        className="border-none bg-zinc-900/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5"
                    >
                        <AccordionTrigger className="px-6 py-4 hover:bg-white/5 transition-colors hover:no-underline group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20">
                                    <Box className="w-4 h-4 text-brand-yellow" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-brand-yellow transition-colors">
                                        {productName}
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                        {groupedLicenses[productName].length} Licenses
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0 border-t border-white/5">
                            {/* Desktop View */}
                            <div className="hidden lg:block">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 pl-6">License Key</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3">Customer</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Activations</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Status</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-center">Expiry</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3 text-right pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedLicenses[productName].map((license) => (
                                            <TableRow key={license.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group/row">
                                                <TableCell className="py-4 pl-6">
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
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View */}
                            <div className="block lg:hidden divide-y divide-white/5">
                                {groupedLicenses[productName].map((license) => (
                                    <div key={license.id} className="p-4 space-y-3">
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
                                                <div className="mt-0.5 text-[9px] text-zinc-500 font-bold uppercase tracking-tight">
                                                    {license.digitalOrder ? license.digitalOrder.userEmail : 'Manual Issue'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[8px] h-4 px-2 uppercase font-black tracking-widest border-white/5",
                                                        license.status === 'active' ? "text-green-500 bg-green-500/5" : "text-zinc-500 bg-zinc-500/5"
                                                    )}
                                                >
                                                    {license.status}
                                                </Badge>
                                                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
                                                    {license.activations}/{license.maxActivations} slots
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
                                                {format(new Date(license.createdAt), 'PP')}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-white/5"
                                                onClick={() => handleDelete(license.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
