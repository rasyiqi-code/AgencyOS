"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/shared/utils";

interface PayoutReq {
    id: string;
    amount: number;
    status: string;
    notes: string | null;
    processedAt: string | null;
    createdAt: string;
    affiliate: {
        name: string;
        email: string;
        referralCode: string;
    };
}

/**
 * Komponen admin: Tabel payout requests dengan tombol approve/reject.
 */
export function PayoutRequests() {
    const [requests, setRequests] = useState<PayoutReq[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/affiliates/payout");
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests);
            }
        } catch {
            console.error("Failed to fetch payout requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId: string, action: "approved" | "rejected") => {
        const notes = action === "rejected"
            ? prompt("Alasan penolakan (opsional):")
            : null;

        setProcessingId(requestId);
        try {
            const res = await fetch("/api/admin/affiliates/payout", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action, notes }),
            });

            if (res.ok) {
                toast.success(`Payout ${action === 'approved' ? 'disetujui' : 'ditolak'}!`);
                fetchRequests();
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal memproses aksi");
            }
        } catch {
            toast.error("Terjadi kesalahan");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
    }

    const pendingRequests = requests.filter(r => r.status === "pending");
    const processedRequests = requests.filter(r => r.status !== "pending");

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="border border-yellow-500/20 rounded-xl overflow-hidden bg-yellow-500/5">
                    <div className="px-3 py-2 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border-b border-yellow-500/10">
                        ⏳ Permintaan Menunggu ({pendingRequests.length})
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left min-w-[500px]">
                            <thead className="bg-zinc-900/50 text-zinc-500 font-bold uppercase tracking-tight text-[10px] border-b border-zinc-800/50">
                                <tr>
                                    <th className="px-4 py-2.5">Mitra</th>
                                    <th className="px-4 py-2.5">Jumlah</th>
                                    <th className="px-4 py-2.5">Tanggal</th>
                                    <th className="px-4 py-2.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {pendingRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="font-bold text-white text-sm">{req.affiliate.name}</div>
                                            <div className="text-[10px] text-zinc-500 italic">{req.affiliate.email}</div>
                                        </td>
                                        <td className="px-4 py-2.5 font-black text-white text-sm">${req.amount.toLocaleString()}</td>
                                        <td className="px-4 py-2.5 text-zinc-400 text-xs font-medium">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, "approved")}
                                                    disabled={processingId === req.id}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-tight transition-colors disabled:opacity-50"
                                                >
                                                    {processingId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "rejected")}
                                                    disabled={processingId === req.id}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-tight transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                    Tolak
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden divide-y divide-zinc-800/50">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="p-3 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 border-l-2 border-yellow-500/30 pl-3">
                                        <div className="font-black text-white text-[13px] uppercase tracking-tight truncate">{req.affiliate.name}</div>
                                        <div className="text-[10px] text-zinc-500 truncate font-medium italic">{req.affiliate.email}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Diminta</div>
                                        <div className="text-white font-black text-sm">${req.amount.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">
                                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(req.id, "approved")}
                                            disabled={processingId === req.id}
                                            className="px-3 py-1.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                        >
                                            Setujui
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, "rejected")}
                                            disabled={processingId === req.id}
                                            className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History */}
            <div className="border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/30">
                <div className="px-3 py-2 bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800/50">
                    📜 Riwayat Pencairan ({processedRequests.length})
                </div>

                {processedRequests.length > 0 ? (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left min-w-[500px]">
                                <thead className="bg-zinc-900/80 text-zinc-500 font-bold uppercase tracking-tight text-[10px] border-b border-zinc-800/50">
                                    <tr>
                                        <th className="px-4 py-2.5">Mitra</th>
                                        <th className="px-4 py-2.5">Jumlah</th>
                                        <th className="px-4 py-2.5">Status</th>
                                        <th className="px-4 py-2.5">Catatan</th>
                                        <th className="px-4 py-2.5">Diproses</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {processedRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <div className="font-bold text-white text-sm">{req.affiliate.name}</div>
                                                <div className="text-[10px] text-zinc-500 italic">{req.affiliate.email}</div>
                                            </td>
                                            <td className="px-4 py-2.5 font-bold text-white text-sm">${req.amount.toLocaleString()}</td>
                                            <td className="px-4 py-2.5">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] px-1.5 py-0 h-4 font-black uppercase tracking-widest",
                                                    req.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    {req.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2.5 text-zinc-500 text-xs italic max-w-[150px] truncate">{req.notes || "—"}</td>
                                            <td className="px-4 py-2.5 text-zinc-600 text-[10px] font-bold uppercase">{req.processedAt ? new Date(req.processedAt).toLocaleDateString() : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-zinc-800/50">
                            {processedRequests.map((req) => (
                                <div key={req.id} className="p-3 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0">
                                            <div className="font-bold text-white text-sm truncate">{req.affiliate.name}</div>
                                            <div className="text-[10px] text-zinc-500 truncate italic">{req.affiliate.email}</div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "text-[8px] px-1.5 py-0 h-3.5 font-black uppercase",
                                            req.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {req.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                            <div className="text-[9px] text-zinc-600 font-bold uppercase">Tanggal Diproses</div>
                                            <div className="text-[10px] text-zinc-400 font-bold">{req.processedAt ? new Date(req.processedAt).toLocaleDateString() : "—"}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-zinc-600 font-black uppercase">Jumlah</div>
                                            <div className="text-white font-black text-sm">${req.amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {req.notes && (
                                        <div className="bg-zinc-950/20 p-2 rounded border border-white/5 text-[10px] text-zinc-500 italic">
                                            {req.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-zinc-600 flex flex-col items-center gap-2">
                        <AlertCircle className="w-5 h-5 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest">Riwayat pencairan tidak ditemukan.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
