import { prisma } from "@/lib/config/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, LayoutGrid, List } from "lucide-react";
import { canManageBilling } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/config/stack";
import { PriceEditor } from "@/components/admin/finance/price-editor";
import { InvoiceActions } from "@/components/admin/finance/invoice-actions";
import { DeleteQuoteButton } from "@/components/shared/delete-quote-button";
import type { StackUser } from "@/lib/shared/types";
import { getTranslations } from "next-intl/server";
import { QuoteGeneratorForm } from "@/components/admin/finance/quote-generator-form";
import { CheckCircle2 } from "lucide-react";

export default async function AdminQuotesPage() {
    const t = await getTranslations("Admin.Finance.Quotes");
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
        <div className="w-full py-6 sm:py-10 space-y-8 animate-in fade-in duration-700">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    {t('title')}
                </h1>
                <p className="text-zinc-400 mt-1 text-sm max-w-2xl leading-relaxed">
                    {t('subtitle')}
                </p>
            </header>

            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl shadow-black/50 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="bg-brand-yellow/10 px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-brand-yellow/20 rounded-lg">
                            <Plus className="w-4 h-4 text-brand-yellow" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-brand-yellow uppercase tracking-[0.2em]">
                            {t('generatorTitle')}
                        </span>
                    </div>
                </div>
                <CardContent className="p-4 sm:p-8 relative z-10">
                    <QuoteGeneratorForm
                        services={services}
                        availableUsers={availableUsers}
                        translations={{
                            selectServiceLabel: t('selectServiceLabel'),
                            selectService: t('selectService'),
                            selectClientLabel: t('selectClientLabel'),
                            displayNameLabel: t('displayNameLabel'),
                            emailLabel: t('emailLabel'),
                            priceLabel: t('priceLabel'),
                            generateButton: t('generateButton')
                        }}
                    />
                </CardContent>
            </Card>

            <section className="space-y-4">
                <div className="flex items-end justify-between px-1">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <List className="w-5 h-5 text-brand-yellow" />
                            {t('listTitle')}
                        </h2>
                        <p className="text-zinc-500 text-xs sm:text-sm">{t('listSubtitle')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {estimates.length === 0 && (
                        <div className="text-center py-12 bg-zinc-900/40 backdrop-blur-md border border-dashed border-zinc-800 rounded-3xl text-zinc-500">
                            {t('empty')}
                        </div>
                    )}
                    {estimates.map((est) => {
                        const clientProfile = est.project?.userId ? userMap.get(est.project.userId) : null;
                        const displayName = est.project?.clientName && est.project.clientName !== "Client"
                            ? est.project.clientName
                            : (clientProfile?.name || est.project?.clientName || "Unknown Client");

                        return (
                            <div key={est.id} className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-5 space-y-4 relative overflow-hidden group active:scale-[0.98] transition-transform">
                                <div className="absolute top-0 right-0 p-4">
                                    <DeleteQuoteButton estimateId={est.id} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Order ID: #{est.id.slice(-8).toUpperCase()}</span>
                                    <h3 className="text-white font-bold text-lg truncate pr-10">{displayName}</h3>
                                    <p className="text-zinc-400 text-xs">{est.service?.title}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Total Price</span>
                                        <PriceEditor
                                            estimateId={est.id}
                                            projectId={est.project?.id || null}
                                            initialPrice={est.totalCost}
                                            currency={est.service?.currency || 'IDR'}
                                        />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <InvoiceActions
                                            estimateId={est.id}
                                            hasEmail={!!(clientProfile?.email && clientProfile.email !== 'N/A')}
                                            clientName={displayName}
                                            serviceTitle={est.service?.title}
                                            amount={est.totalCost}
                                            currency={est.service?.currency || 'IDR'}
                                        />
                                        {est.status === 'paid' && (
                                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full uppercase border border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {t('statusPaid')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Card className="hidden sm:block bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 overflow-hidden rounded-3xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="border-zinc-800/50 bg-white/5">
                                    <TableRow className="border-zinc-800/50 hover:bg-transparent">
                                        <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{t('colOrderId')}</TableHead>
                                        <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{t('colClient')}</TableHead>
                                        <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{t('colService')}</TableHead>
                                        <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6 text-right">{t('colTotalPrice')}</TableHead>
                                        <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{t('colInvoice')}</TableHead>
                                        <TableHead className="text-center text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{t('colAction')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {estimates.length === 0 && (
                                        <TableRow className="border-zinc-800/50">
                                            <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <LayoutGrid className="w-10 h-10 opacity-20" />
                                                    <p>{t('empty')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {estimates.map((est) => {
                                        const clientProfile = est.project?.userId ? userMap.get(est.project.userId) : null;
                                        const displayName = est.project?.clientName && est.project.clientName !== "Client"
                                            ? est.project.clientName
                                            : (clientProfile?.name || est.project?.clientName || "Unknown Client");

                                        return (
                                            <TableRow key={est.id} className="border-zinc-800/50 hover:bg-white/[0.03] transition-colors group">
                                                <TableCell className="py-4 px-6 font-mono text-[11px] text-zinc-500">
                                                    #{est.id.slice(-8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <span className="font-bold text-white text-sm tracking-tight group-hover:text-brand-yellow transition-colors">{displayName}</span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-zinc-400 text-sm italic">
                                                    {est.service?.title}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right">
                                                    <PriceEditor
                                                        estimateId={est.id}
                                                        projectId={est.project?.id || null}
                                                        initialPrice={est.totalCost}
                                                        currency={est.service?.currency || 'IDR'}
                                                    />
                                                </TableCell>
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <InvoiceActions
                                                            estimateId={est.id}
                                                            hasEmail={!!(clientProfile?.email && clientProfile.email !== 'N/A')}
                                                            clientName={displayName}
                                                            serviceTitle={est.service?.title}
                                                            amount={est.totalCost}
                                                            currency={est.service?.currency || 'IDR'}
                                                        />
                                                        {est.status === 'paid' && (
                                                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full uppercase border border-emerald-500/20">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                {t('statusPaid')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <DeleteQuoteButton estimateId={est.id} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
