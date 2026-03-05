import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { DeleteQuoteButton } from "@/components/shared/delete-quote-button";

export default async function ClientQuotesPage() {
    const user = await stackServerApp.getUser();
    if (!user) return null;

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

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
                    {isId ? 'Penawaran Harga' : 'My Quotes'}
                </h1>
                <p className="text-zinc-400 mt-1">
                    {isId
                        ? 'Pantau status negosiasi harga untuk layanan kustom Anda.'
                        : 'Track the status of your price negotiations for custom services.'}
                </p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">
                        {isId ? 'Riwayat Penawaran' : 'Quote History'}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        {isId
                            ? 'Daftar permintaan harga yang sedang diproses.'
                            : 'List of your price requests currently in progress.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="border-zinc-800">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">{isId ? 'Layanan' : 'Service'}</TableHead>
                                <TableHead className="text-zinc-400">{isId ? 'Harga Penawaran' : 'Offered Price'}</TableHead>
                                <TableHead className="text-right text-zinc-400">{isId ? 'Aksi' : 'Action'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estimates.length === 0 && (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={4} className="text-center py-12 text-zinc-500">
                                        {isId ? 'Belum ada permintaan penawaran harga.' : 'No quote requests found.'}
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
                                        {new Intl.NumberFormat(isId ? 'id-ID' : 'en-US', {
                                            style: 'currency',
                                            currency: est.service?.currency || 'USD'
                                        }).format(est.totalCost)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <DeleteQuoteButton estimateId={est.id} userId={user.id} />
                                            <Link href={`/checkout/${est.id}`}>
                                                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8">
                                                    {est.status === 'pending_payment' ? (isId ? 'Bayar' : 'Pay') : (isId ? 'Detail' : 'Detail')}
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
