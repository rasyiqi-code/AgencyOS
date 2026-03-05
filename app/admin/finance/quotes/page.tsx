import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { canManageBilling } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/config/stack";
import { PriceEditor } from "@/components/admin/finance/price-editor";
import { UserSelector } from "@/components/admin/finance/user-selector";
import { InvoiceActions } from "@/components/admin/finance/invoice-actions";
import { createManualQuote } from "@/app/actions/quotes";
import { DeleteQuoteButton } from "@/components/shared/delete-quote-button";
import type { StackUser } from "@/lib/shared/types";

export default async function AdminQuotesPage() {
    const hasAccess = await canManageBilling();
    if (!hasAccess) {
        redirect("/admin");
    }

    // Ambil Estimate yang bertipe STARTING_AT
    const estimates = await prisma.estimate.findMany({
        where: {
            service: {
                priceType: "STARTING_AT"
            }
        },
        include: {
            service: true,
            project: true,
        },
        orderBy: { createdAt: "desc" }
    });

    const services = await prisma.service.findMany({
        where: { priceType: "STARTING_AT" }
    });

    // Ambil daftar user unik dari Ticket & Project, dan JUGA dari Stack Auth
    const [tickets, projects, stackUsers] = await Promise.all([
        prisma.ticket.findMany({
            where: { userId: { not: null } },
            select: { userId: true, name: true, email: true }
        }),
        prisma.project.findMany({
            select: { userId: true, clientName: true }
        }),
        stackServerApp.listUsers({ limit: 100 })
    ]);

    // Gabungkan & Deduplicate
    const userMap = new Map<string, { id: string, name: string, email?: string }>();

    // Inisialisasi dengan opsi Offline agar selalu di atas dan unik
    userMap.set('OFFLINE', { id: 'OFFLINE', name: 'Offline / Transaksi Luar Sistem', email: 'N/A' });

    // Prioritas 1: Stack Auth (Sumber Utama)
    stackUsers.forEach((u: StackUser) => {
        userMap.set(u.id, {
            id: u.id,
            name: u.displayName || u.primaryEmail || 'User',
            email: u.primaryEmail || ''
        });
    });

    // Prioritas 2 & 3: Ticket & Project (Hanya ambil jika nama lebih spesifik & BUKAN 'OFFLINE')
    tickets.forEach((t) => {
        if (t.userId && t.userId !== 'OFFLINE') {
            const existing = userMap.get(t.userId);
            const betterName = (t.name && t.name !== "Client" && t.name !== "Unknown")
                ? t.name
                : (existing?.name || t.name || 'Unknown');

            userMap.set(t.userId, {
                id: t.userId,
                name: betterName,
                email: t.email || existing?.email || ''
            });
        }
    });

    projects.forEach((p) => {
        if (p.userId && p.userId !== 'OFFLINE') {
            const existing = userMap.get(p.userId);
            const betterName = (p.clientName && p.clientName !== "Client" && p.clientName !== "Unknown")
                ? p.clientName
                : (existing?.name || p.clientName || 'Unknown');

            userMap.set(p.userId, {
                id: p.userId,
                name: betterName,
                email: existing?.email || ''
            });
        }
    });

    const availableUsers = Array.from(userMap.values());


    return (
        <div className="container mx-auto py-10 max-w-6xl">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 text-brand-yellow">Quote Generator</h1>
            <p className="text-zinc-400 mb-8">Buat penawaran harga manual atau kelola request dari klien.</p>

            <Card className="bg-zinc-900 border-zinc-800 mb-8 overflow-hidden">
                <div className="bg-brand-yellow/10 px-6 py-3 border-b border-brand-yellow/20 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand-yellow" />
                    <span className="text-sm font-bold text-brand-yellow uppercase tracking-wider">Generator Penawaran Baru</span>
                </div>
                <CardContent className="pt-6">
                    <form action={async (formData) => { "use server"; await createManualQuote(formData); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">Pilih Layanan</label>
                            <select
                                name="serviceId"
                                defaultValue=""
                                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow"
                                required
                            >
                                <option value="" disabled>Pilih Layanan...</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">Pilih Klien (User)</label>
                            <UserSelector users={availableUsers} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">Display Name (Label)</label>
                            <input
                                name="clientName"
                                placeholder="E.g. John Doe"
                                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">Harga Penawaran</label>
                            <input
                                name="amount"
                                type="number"
                                placeholder="E.g. 500"
                                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow font-mono"
                                required
                            />
                        </div>
                        <Button type="submit" className="bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-[38px]">
                            Generate Quote
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Daftar Penawaran</CardTitle>
                    <CardDescription className="text-zinc-400">Silakan review harga yang ditawarkan oleh klien.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="border-zinc-800">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Order ID</TableHead>
                                <TableHead className="text-zinc-400">Client</TableHead>
                                <TableHead className="text-zinc-400">Service</TableHead>
                                <TableHead className="text-right text-zinc-400">Total Price (Editable)</TableHead>
                                <TableHead className="text-right text-zinc-400">Invoice</TableHead>
                                <TableHead className="text-center text-zinc-400">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estimates.length === 0 && (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                        Belum ada history/request penawaran harga.
                                    </TableCell>
                                </TableRow>
                            )}
                            {estimates.map((est) => {
                                const clientProfile = est.project?.userId ? userMap.get(est.project.userId) : null;
                                const displayName = est.project?.clientName && est.project.clientName !== "Client"
                                    ? est.project.clientName
                                    : (clientProfile?.name || est.project?.clientName || "Unknown Client");

                                return (
                                    <TableRow key={est.id} className="border-zinc-800 hover:bg-white/5">
                                        <TableCell className="font-mono text-xs text-zinc-300">#{est.id.slice(-8).toUpperCase()}</TableCell>
                                        <TableCell className="font-medium text-white">{displayName}</TableCell>
                                        <TableCell className="text-zinc-300">{est.service?.title}</TableCell>
                                        <TableCell className="text-right">
                                            <PriceEditor
                                                estimateId={est.id}
                                                projectId={est.project?.id || null}
                                                initialPrice={est.totalCost}
                                                currency={est.service?.currency || 'IDR'}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <InvoiceActions
                                                estimateId={est.id}
                                                hasEmail={!!(clientProfile?.email && clientProfile.email !== 'N/A')}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DeleteQuoteButton estimateId={est.id} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
