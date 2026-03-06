import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DeleteQuoteButton } from "@/components/shared/delete-quote-button";
import { getTranslations } from "next-intl/server";
import { QuotePriceCell } from "@/components/admin/finance/quote-price-cell";

/**
 * Halaman daftar penawaran harga (quotes) milik klien.
 * Mendukung i18n via next-intl dan currency switching via PriceDisplay.
 */
export default async function ClientQuotesPage() {
    const user = await stackServerApp.getUser();
    if (!user) return null;

    const t = await getTranslations("Dashboard.ClientQuotes");

    // Ambil Estimates milik user yang bertipe STARTING_AT
    const estimates = await prisma.estimate.findMany({
        where: {
            project: {
                userId: user.id
            },
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

    return (
        <div className="w-full py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-zinc-400 mt-1">
                    {t('subtitle')}
                </p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">
                        {t('historyTitle')}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        {t('historyDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="border-zinc-800">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">{t('colService')}</TableHead>
                                <TableHead className="text-zinc-400">{t('colOfferedPrice')}</TableHead>
                                <TableHead className="text-right text-zinc-400">{t('colAction')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estimates.length === 0 && (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={4} className="text-center py-12 text-zinc-500">
                                        {t('empty')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {estimates.map((est) => (
                                <TableRow key={est.id} className="border-zinc-800 hover:bg-white/5">
                                    <TableCell>
                                        <div className="font-medium text-white">{est.service?.title || est.title}</div>
                                        <div className="text-xs text-zinc-500 font-mono">#{est.id.slice(-8).toUpperCase()}</div>
                                    </TableCell>
                                    <TableCell className="text-emerald-400 font-bold">
                                        {/* Client component for dynamic currency display */}
                                        <QuotePriceCell
                                            amount={est.totalCost}
                                            baseCurrency={(est.service?.currency as "USD" | "IDR") || 'USD'}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <DeleteQuoteButton estimateId={est.id} userId={user.id} />
                                            <Link href={`/checkout/${est.id}`}>
                                                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8">
                                                    {est.status === 'pending_payment' ? t('pay') : t('detail')}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
