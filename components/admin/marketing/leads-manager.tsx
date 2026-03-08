"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Search, Mail, User, Phone, Globe, Navigation } from "lucide-react";
import { toast } from "sonner";

interface Lead {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phoneNumber: string | null;
    subject: string | null;
    message: string | null;
    source: string;
    path: string | null;
    locale: string | null;
    createdAt: string;
}

export function LeadsManager() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const response = await fetch('/api/admin/marketing/leads');
            if (!response.ok) throw new Error("Failed to load");
            const data = await response.json();
            setLeads(data);
        } catch {
            toast.error("Gagal memuat leads");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus lead ini?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/leads?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("Lead berhasil dihapus");
            loadLeads();
        } catch {
            toast.error("Gagal menghapus lead");
        }
    };

    const filteredLeads = leads.filter(l =>
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.lastName && l.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.subject && l.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="grid gap-4 md:gap-6">
            <div className="p-3 md:p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                        placeholder="Cari email, nama, atau subjek..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-black/50 border-white/10 text-sm"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden overflow-x-auto custom-scrollbar">
                <Table className="min-w-[1000px]">
                    <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-xs h-10">Lead</TableHead>
                            <TableHead className="text-xs h-10">Kontak</TableHead>
                            <TableHead className="text-xs h-10">Sumber & Konteks</TableHead>
                            <TableHead className="text-xs h-10">Pesan</TableHead>
                            <TableHead className="text-xs h-10">Tanggal</TableHead>
                            <TableHead className="text-right text-xs h-10">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-sm">Memuat...</TableCell>
                            </TableRow>
                        ) : filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-sm">
                                    {searchQuery ? "Lead tidak ditemukan." : "Belum ada lead."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.id} className="border-white/5">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="grid">
                                                <span className="font-bold text-white text-sm uppercase tracking-tight">
                                                    {lead.firstName} {lead.lastName}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Mail className="w-3 h-3 opacity-50" />
                                                {lead.email}
                                            </div>
                                            {lead.phoneNumber && (
                                                <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                                                    <Phone className="w-2.5 h-2.5 opacity-40" />
                                                    {lead.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                    {lead.source.replace('_', ' ')}
                                                </span>
                                                {lead.locale && (
                                                    <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold uppercase">
                                                        <Globe className="w-2.5 h-2.5" />
                                                        {lead.locale}
                                                    </span>
                                                )}
                                            </div>
                                            {lead.path && (
                                                <div className="flex items-center gap-1 text-[9px] text-zinc-600 truncate max-w-[150px]">
                                                    <Navigation className="w-2.5 h-2.5 opacity-30" />
                                                    {lead.path}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[250px]">
                                        <div className="space-y-1">
                                            {lead.subject && (
                                                <div className="text-[11px] font-bold text-zinc-300 truncate">
                                                    {lead.subject}
                                                </div>
                                            )}
                                            {lead.message && (
                                                <div className="text-[10px] text-zinc-500 italic line-clamp-2 leading-relaxed">
                                                    &quot;{lead.message}&quot;
                                                </div>
                                            )}
                                            {!lead.subject && !lead.message && (
                                                <span className="text-[10px] text-zinc-700 italic">No message</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-[11px] font-medium font-mono uppercase">
                                        {format(new Date(lead.createdAt), 'MMM dd, HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => handleDelete(lead.id)}
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
