"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, DollarSign, Users, Clock, AlertCircle, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Affiliate {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    status: string;
    commissionRate: number;
    totalEarnings: number;
    paidEarnings: number;
    createdAt: string;
    bankName?: string;
    bankAccount?: string;
    bankHolder?: string;
    _count: {
        referrals: number;
        commissions: number;
    };
}

interface Stats {
    totalAffiliates: number;
    totalPaid: number;
    pendingPayouts: number;
    totalEarnings: number;
}

/**
 * Komponen admin untuk mengelola affiliates.
 * Menampilkan stats dan tabel affiliates dengan inline edit commission rate & status.
 */
export function AffiliateManager() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ affiliates: Affiliate[], stats: Stats, defaultRate: number, resendApiKey?: string } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRate, setEditRate] = useState<number>(0);
    const [editStatus, setEditStatus] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [viewingAffiliate, setViewingAffiliate] = useState<Affiliate | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/affiliates");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch affiliates", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /** Mulai edit inline */
    const startEdit = (aff: Affiliate) => {
        setEditingId(aff.id);
        setEditRate(aff.commissionRate);
        setEditStatus(aff.status);
    };

    /** Batal edit */
    const cancelEdit = () => {
        setEditingId(null);
    };

    /** Simpan perubahan */
    const saveEdit = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/affiliates/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commissionRate: editRate, status: editStatus }),
            });

            if (res.ok) {
                toast.success("Affiliate updated!");
                setEditingId(null);
                fetchData();
            } else {
                const errData = await res.json();
                toast.error(errData.error || "Update failed");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
    }

    if (!data) {
        return <div className="text-center p-10 text-red-500 flex flex-col items-center gap-2"><AlertCircle /> Failed to load data</div>;
    }

    const statusOptions = ["pending", "active", "suspended"];

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Partners</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data.stats.totalAffiliates}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Pending Payouts</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${data.stats.pendingPayouts.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Paid</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${data.stats.totalPaid.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-end items-center gap-4">
                {/* Resend API Key Config */}
                <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-zinc-400">Resend API Key:</span>
                    <input
                        type="password"
                        placeholder={data.resendApiKey ? "********" : "re_123..."}
                        className="w-24 bg-transparent border-none p-0 text-sm font-medium text-white text-right focus:ring-0 placeholder:text-zinc-600"
                        onBlur={async (e) => {
                            const val = e.target.value;
                            if (!val) return;
                            try {
                                await fetch("/api/admin/system/settings", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ key: "RESEND_API_KEY", value: val })
                                });
                                toast.success("API Key updated");
                                e.target.value = ""; // Clear input for security
                            } catch {
                                toast.error("Failed to update");
                            }
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-zinc-400">Default Rate:</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="10"
                        className="w-12 bg-transparent border-none p-0 text-sm font-medium text-white text-right focus:ring-0"
                        defaultValue={data.defaultRate}
                        onBlur={async (e) => {
                            const val = e.target.value;
                            if (!val) return;
                            try {
                                await fetch("/api/admin/system/settings", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ key: "affiliate_default_commission_rate", value: val })
                                });
                                toast.success("Default rate updated");
                            } catch {
                                toast.error("Failed to update");
                            }
                        }}
                    />
                    <span className="text-sm text-zinc-500">%</span>
                </div>
            </div>

            {/* Table */}
            <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-900/80 text-zinc-400 font-medium">
                        <tr>
                            <th className="px-4 py-3">Partner</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Comm. Rate</th>
                            <th className="px-4 py-3 text-right">Clicks</th>
                            <th className="px-4 py-3 text-right">Sales</th>
                            <th className="px-4 py-3 text-right">Earnings</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {data.affiliates.map((aff) => {
                            const isEditing = editingId === aff.id;
                            return (
                                <tr key={aff.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{aff.name}</div>
                                        <div className="text-xs text-zinc-500">{aff.email}</div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-zinc-300">{aff.referralCode}</td>
                                    <td className="px-4 py-3">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={editRate}
                                                onChange={(e) => setEditRate(Number(e.target.value))}
                                                className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                                            />
                                        ) : (
                                            <span>{aff.commissionRate}%</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">{aff._count.referrals}</td>
                                    <td className="px-4 py-3 text-right">{aff._count.commissions}</td>
                                    <td className="px-4 py-3 text-right font-medium text-green-400">${aff.totalEarnings.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        {isEditing ? (
                                            <select
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                                            >
                                                {statusOptions.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Badge
                                                variant={aff.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    aff.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                                                        aff.status === 'suspended' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                }
                                            >
                                                {aff.status}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => saveEdit(aff.id)}
                                                    disabled={saving}
                                                    className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-1.5 rounded-md bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setViewingAffiliate(aff)}
                                                    className="p-1.5 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => startEdit(aff)}
                                                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {data.affiliates.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-zinc-500 italic">No affiliates yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Dialog */}
            {viewingAffiliate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                            <h3 className="font-semibold text-white">Partner Details</h3>
                            <button onClick={() => setViewingAffiliate(null)} className="text-zinc-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Profile Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-400">
                                        {viewingAffiliate.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-white">{viewingAffiliate.name}</div>
                                        <div className="text-zinc-400 text-sm">{viewingAffiliate.email}</div>
                                        <Badge variant="outline" className="mt-1 bg-zinc-950/50 text-zinc-400 border-zinc-800 font-mono text-xs">
                                            {viewingAffiliate.id}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-800 w-full" />

                            {/* Bank Details */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Bank Information
                                </h4>
                                <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-zinc-500 block mb-1">Bank Name</label>
                                            <div className="font-medium text-white">{viewingAffiliate.bankName || "-"}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500 block mb-1">Account Holder</label>
                                            <div className="font-medium text-white">{viewingAffiliate.bankHolder || "-"}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Account Number</label>
                                        <div className="flex items-center justify-between bg-zinc-900 rounded px-2 py-1 border border-zinc-800">
                                            <code className="font-mono text-yellow-400">{viewingAffiliate.bankAccount || "-"}</code>
                                            {viewingAffiliate.bankAccount && (
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(viewingAffiliate.bankAccount!);
                                                        toast.success("Copied to clipboard");
                                                    }}
                                                    className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white"
                                                >
                                                    <Users className="w-3 h-3" /> {/* Recycle icon for copy */}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-zinc-800/50 p-2 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500">Rate</div>
                                    <div className="font-bold text-white">{viewingAffiliate.commissionRate}%</div>
                                </div>
                                <div className="bg-zinc-800/50 p-2 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500">Earnings</div>
                                    <div className="font-bold text-emerald-400">${viewingAffiliate.totalEarnings}</div>
                                </div>
                                <div className="bg-zinc-800/50 p-2 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500">Clicks</div>
                                    <div className="font-bold text-white">{viewingAffiliate._count.referrals}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 text-right">
                            <button onClick={() => setViewingAffiliate(null)} className="px-4 py-2 bg-white text-black font-medium text-sm rounded-md hover:bg-zinc-200 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
