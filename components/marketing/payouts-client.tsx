"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PayoutRequestData {
    id: string;
    amount: number;
    status: string;
    notes: string | null;
    processedAt: string | null;
    createdAt: string;
}

interface PayoutsClientProps {
    /** Saldo awal yang tersedia (dari server) */
    initialBalance: number;
    /** Nama affiliate */
    affiliateName: string;
    /** Total earnings lifetime */
    totalEarnings: number;
    /** Total yang sudah dibayarkan */
    paidEarnings: number;
}

/**
 * Client component halaman Payouts.
 * Menampilkan saldo, tombol request payout, dan riwayat request.
 */
export function PayoutsClient({ initialBalance, affiliateName, totalEarnings, paidEarnings }: PayoutsClientProps) {
    const [requests, setRequests] = useState<PayoutRequestData[]>([]);
    const [balance, setBalance] = useState(initialBalance);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    const MIN_PAYOUT = 50;

    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch("/api/marketing/affiliate/payout/request");
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests);
                setBalance(data.balance);
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

    const handleRequestPayout = async () => {
        setRequesting(true);
        try {
            const res = await fetch("/api/marketing/affiliate/payout/request", { method: "POST" });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Request failed");
                return;
            }

            toast.success(`Payout request of $${balance.toLocaleString()} submitted!`);
            fetchRequests(); // Refresh list
        } catch {
            toast.error("Something went wrong");
        } finally {
            setRequesting(false);
        }
    };

    /** Status badge helper */
    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
            approved: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
            rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        };
        return (
            <Badge variant="secondary" className={styles[status] || ""}>
                {status}
            </Badge>
        );
    };

    // Cek apakah ada pending request
    const hasPendingRequest = requests.some(r => r.status === "pending");
    const canRequest = balance >= MIN_PAYOUT && !hasPendingRequest;

    return (
        <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Payouts & Earnings</h1>
                    <p className="text-zinc-400 mt-2">
                        Manage your withdrawals and view transaction history.
                    </p>
                </div>
                <button
                    onClick={handleRequestPayout}
                    disabled={!canRequest || requesting}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                        ${canRequest
                            ? "bg-white text-black hover:bg-zinc-200"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
                >
                    {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    Request Payout
                </button>
            </div>

            {/* Info jika tidak bisa request */}
            {hasPendingRequest && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-yellow-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    You have a pending payout request. Please wait for it to be processed.
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Available for Payout</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${balance.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Min. withdrawal ${MIN_PAYOUT}</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Paid</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${paidEarnings.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Lifetime withdrawals</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Gross revenue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payout Request History */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">Payout Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="rounded-md border border-zinc-800 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-900/80 text-zinc-400 font-medium border-b border-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Notes</th>
                                        <th className="px-4 py-3">Processed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-3 text-zinc-300">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-white">
                                                ${req.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(req.status)}</td>
                                            <td className="px-4 py-3 text-zinc-400 text-xs max-w-[200px] truncate">
                                                {req.notes || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500 text-xs">
                                                {req.processedAt ? new Date(req.processedAt).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed flex flex-col items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            No payout requests yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
