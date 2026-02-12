"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
            ? prompt("Reason for rejection (optional):")
            : null;

        setProcessingId(requestId);
        try {
            const res = await fetch("/api/admin/affiliates/payout", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action, notes }),
            });

            if (res.ok) {
                toast.success(`Payout ${action}!`);
                fetchRequests();
            } else {
                const data = await res.json();
                toast.error(data.error || "Action failed");
            }
        } catch {
            toast.error("Something went wrong");
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
        <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="border border-yellow-500/20 rounded-lg overflow-hidden bg-yellow-500/5">
                    <div className="px-4 py-3 bg-yellow-500/10 text-yellow-400 text-sm font-medium">
                        ⏳ Pending Requests ({pendingRequests.length})
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900/50 text-zinc-400 font-medium border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3">Partner</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {pendingRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{req.affiliate.name}</div>
                                        <div className="text-xs text-zinc-500">{req.affiliate.email}</div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-white">${req.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-zinc-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleAction(req.id, "approved")}
                                                disabled={processingId === req.id}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {processingId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, "rejected")}
                                                disabled={processingId === req.id}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* History */}
            <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
                <div className="px-4 py-3 bg-zinc-900/50 text-zinc-300 text-sm font-medium">
                    History ({processedRequests.length})
                </div>
                {processedRequests.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900/80 text-zinc-400 font-medium border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3">Partner</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Notes</th>
                                <th className="px-4 py-3">Processed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {processedRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{req.affiliate.name}</div>
                                        <div className="text-xs text-zinc-500">{req.affiliate.email}</div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-white">${req.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className={
                                            req.status === "approved" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                        }>
                                            {req.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-[200px] truncate">{req.notes || "—"}</td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">{req.processedAt ? new Date(req.processedAt).toLocaleDateString() : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-8 text-zinc-500 flex flex-col items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        No processed requests yet.
                    </div>
                )}
            </div>
        </div>
    );
}
