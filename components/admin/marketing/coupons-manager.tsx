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
            toast.error("Failed to load coupons");
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

            toast.success("Coupon created successfully");
            setNewCoupon({ code: "", discountType: "percentage", discountValue: "", maxUses: "", expiresAt: "", appliesTo: ["DIGITAL", "SERVICE", "CALCULATOR"] });
            loadCoupons();
        } catch {
            toast.error("Failed to create coupon");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/coupons?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("Coupon deleted");
            loadCoupons();
        } catch {
            toast.error("Failed to delete coupon");
        }
    };

    return (
        <div className="grid gap-6">
            {/* Create Form */}
            <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/40 space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand-yellow" />
                    Create New Coupon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Input
                        placeholder="Code (e.g. WELCOME20)"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                        className="uppercase"
                    />
                    <Select
                        value={newCoupon.discountType}
                        onValueChange={(val) => setNewCoupon({ ...newCoupon, discountType: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        placeholder="Value"
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    />
                    <Input
                        type="number"
                        placeholder="Max Uses (Optional)"
                        value={newCoupon.maxUses}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            placeholder="Expiry (Optional)"
                            value={newCoupon.expiresAt}
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                        />
                        <Button onClick={handleCreate} className="bg-brand-yellow text-black hover:bg-brand-yellow/80 shrink-0">
                            Create
                        </Button>
                    </div>
                </div>

                {/* Scoping badges */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    <span className="text-xs text-zinc-500 mr-2 self-center">Applies To:</span>
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
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${newCoupon.appliesTo.includes(type)
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
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Scope</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Loading...</TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">No coupons found.</TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id} className="border-white/5">
                                    <TableCell className="font-mono font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-3 h-3 text-brand-yellow" />
                                            {coupon.code}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span className="text-white">{coupon.usedCount} used</span>
                                            {coupon.maxUses && <span className="text-zinc-500">of {coupon.maxUses} max</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {coupon.appliesTo?.map(t => (
                                                <Badge key={t} variant="outline" className="text-[9px] px-1 py-0 h-4 border-zinc-800 text-zinc-400">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm italic">
                                        {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM dd, yyyy') : 'No Expiry'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={coupon.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-white/10"}>
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => handleDelete(coupon.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
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
