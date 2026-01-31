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
            toast.error("Failed to load subscribers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscriber?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/subscribers?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("Subscriber removed");
            loadSubscribers();
        } catch {
            toast.error("Failed to remove subscriber");
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="grid gap-6">
            {/* Search */}
            <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search by email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10"
                    />
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead>Subscriber</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">Loading...</TableCell>
                            </TableRow>
                        ) : filteredSubscribers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                                    {searchQuery ? "No subscribers match your search." : "No subscribers yet."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSubscribers.map((subscriber) => (
                                <TableRow key={subscriber.id} className="border-white/5">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-white">{subscriber.name || "Anonymous"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Mail className="w-3 h-3" />
                                            {subscriber.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm">
                                        {format(new Date(subscriber.createdAt), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => handleDelete(subscriber.id)}
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
