import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { revalidatePath } from "next/cache";
import { CheckCircle, Clock, FileText } from "lucide-react";
import Link from "next/link"; // Ensure Link is imported

export default async function AdminInvoicesPage() {
    const estimates = await prisma.estimate.findMany({
        where: { status: { not: "draft" } },
        orderBy: { createdAt: "desc" }
    });

    async function markAsPaid(id: string) {
        "use server";
        await prisma.estimate.update({
            where: { id },
            data: { status: "paid" }
        });
        revalidatePath("/dashboard/admin/invoices");
    }

    return (
        <div className="container mx-auto py-10 max-w-6xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-8">Invoices & Payments</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estimates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                        No active invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {estimates.map((est) => (
                                <TableRow key={est.id}>
                                    <TableCell className="font-mono text-xs">#{est.id.slice(-8).toUpperCase()}</TableCell>
                                    <TableCell className="font-medium">{est.title}</TableCell>
                                    <TableCell>${est.totalCost.toLocaleString()}</TableCell>
                                    <TableCell>
                                        {est.status === 'paid' ? (
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {new Date(est.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Link href={`/checkout/${est.id}`} target="_blank">
                                            <Button variant="ghost" size="sm">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        {est.status !== 'paid' && (
                                            <form action={markAsPaid.bind(null, est.id)}>
                                                <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                                                    Mark Paid
                                                </Button>
                                            </form>
                                        )}
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
