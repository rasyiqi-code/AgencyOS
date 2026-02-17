"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Search, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export function SubscribersManager() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        try {
            const response = await fetch('/api/admin/marketing/subscribers');
            if (!response.ok) throw new Error("Failed to load");
            const data = await response.json();
            setSubscribers(data);
        } catch {
            toast.error("Gagal memuat pelanggan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/subscribers?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("Pelanggan berhasil dihapus");
            loadSubscribers();
        } catch {
            toast.error("Gagal menghapus pelanggan");
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="grid gap-4 md:gap-6">
            {/* Search */}
            <div className="p-3 md:p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                        placeholder="Cari email atau nama..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-black/50 border-white/10 text-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden overflow-x-auto custom-scrollbar">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table className="min-w-[600px]">
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs h-10">Pelanggan</TableHead>
                                <TableHead className="text-xs h-10">Email</TableHead>
                                <TableHead className="text-xs h-10">Tanggal Bergabung</TableHead>
                                <TableHead className="text-right text-xs h-10">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500 text-sm">Memuat...</TableCell>
                                </TableRow>
                            ) : filteredSubscribers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500 text-sm">
                                        {searchQuery ? "Pelanggan tidak ditemukan." : "Belum ada pelanggan."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubscribers.map((subscriber) => (
                                    <TableRow key={subscriber.id} className="border-white/5">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-medium text-white text-sm">{subscriber.name || "Anonymous"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Mail className="w-3 h-3 opacity-50" />
                                                {subscriber.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 text-[11px] font-medium font-mono uppercase">
                                            {format(new Date(subscriber.createdAt), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                                onClick={() => handleDelete(subscriber.id)}
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

                {/* Mobile View */}
                <div className="block md:hidden divide-y divide-white/5">
                    {isLoading ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">Memuat...</div>
                    ) : filteredSubscribers.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-10" />
                            <p className="text-xs font-bold uppercase tracking-widest">{searchQuery ? "Tidak ditemukan" : "Belum ada pelanggan"}</p>
                        </div>
                    ) : (
                        filteredSubscribers.map((subscriber) => (
                            <div key={subscriber.id} className="p-3 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow shrink-0">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-white text-[13px] uppercase tracking-tight truncate">{subscriber.name || "Anonymous"}</div>
                                            <div className="flex items-center gap-1 text-zinc-500">
                                                <Mail className="w-2.5 h-2.5 opacity-40" />
                                                <span className="text-[10px] font-medium truncate">{subscriber.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        onClick={() => handleDelete(subscriber.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Tanggal Bergabung</span>
                                    <span className="text-[10px] text-zinc-400 font-bold font-mono uppercase">{format(new Date(subscriber.createdAt), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
