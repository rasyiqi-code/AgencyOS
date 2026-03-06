import { prisma } from "@/lib/config/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
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
        <div className="w-full py-4 sm:py-6">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white mb-1 sm:mb-2 text-brand-yellow">{t('title')}</h1>
            <p className="text-zinc-400 mb-6 sm:mb-8 text-xs sm:text-base break-words">{t('subtitle')}</p>

            <Card className="bg-zinc-900 border-zinc-800 mb-6 sm:mb-8 overflow-hidden">
                <div className="bg-brand-yellow/10 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-brand-yellow/20 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand-yellow" />
                    <span className="text-xs sm:text-sm font-bold text-brand-yellow uppercase tracking-wider">{t('generatorTitle')}</span>
                </div>
                <CardContent className="p-3 sm:p-6">
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

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-white text-base sm:text-lg">{t('listTitle')}</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs sm:text-sm">{t('listSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[640px]">
                            <TableHeader className="border-zinc-800">
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400 text-xs">{t('colOrderId')}</TableHead>
                                    <TableHead className="text-zinc-400 text-xs">{t('colClient')}</TableHead>
                                    <TableHead className="text-zinc-400 text-xs hidden sm:table-cell">{t('colService')}</TableHead>
                                    <TableHead className="text-zinc-400 text-xs text-left sm:text-right">{t('colTotalPrice')}</TableHead>
                                    <TableHead className="text-zinc-400 text-xs">{t('colInvoice')}</TableHead>
                                    <TableHead className="text-center text-zinc-400 text-xs">{t('colAction')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estimates.length === 0 && (
                                    <TableRow className="border-zinc-800">
                                        <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                            {t('empty')}
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
                                            <TableCell className="font-mono text-xs text-zinc-300 whitespace-nowrap">#{est.id.slice(-8).toUpperCase()}</TableCell>
                                            <TableCell className="font-medium text-white text-sm whitespace-nowrap">{displayName}</TableCell>
                                            <TableCell className="text-zinc-300 text-sm hidden sm:table-cell">{est.service?.title}</TableCell>
                                            <TableCell className="text-left sm:text-right">
                                                <PriceEditor
                                                    estimateId={est.id}
                                                    projectId={est.project?.id || null}
                                                    initialPrice={est.totalCost}
                                                    currency={est.service?.currency || 'IDR'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <InvoiceActions
                                                        estimateId={est.id}
                                                        hasEmail={!!(clientProfile?.email && clientProfile.email !== 'N/A')}
                                                        clientName={displayName}
                                                        serviceTitle={est.service?.title}
                                                        amount={est.totalCost}
                                                        currency={est.service?.currency || 'IDR'}
                                                    />
                                                    {est.status === 'paid' && (
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit uppercase shrink-0">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {t('statusPaid')}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
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
        </div>
    );
}
