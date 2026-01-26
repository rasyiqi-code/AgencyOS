
import { prisma } from "@/lib/db";
import { ShoppingCart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmPaymentButton } from "@/components/admin/orders/confirm-payment";
import { ViewProofButton } from "@/components/admin/orders/view-proof-button";
import { InvoiceDownloadButton } from "@/components/admin/orders/invoice-download-button";

export default async function AdminOrdersPage() {
    const estimates = await prisma.estimate.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                include: { order: true }
            }
        }
    });

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">Financials</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Orders & Invoices
                        <ShoppingCart className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Track payments, invoices, and estimate statuses.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-zinc-400">Invoice ID</TableHead>
                            <TableHead className="text-zinc-400">Project</TableHead>
                            <TableHead className="text-zinc-400">Amount</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Proof</TableHead>
                            <TableHead className="text-zinc-400">Date</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {estimates.length === 0 ? (
                            <TableRow className="border-white/5">
                                <TableCell colSpan={6} className="text-center h-32 text-zinc-500">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : estimates.map((estimate) => (
                            <TableRow key={estimate.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="font-mono text-xs text-white">#{estimate.id.slice(-8).toUpperCase()}</TableCell>
                                <TableCell className="text-zinc-300 text-sm truncate max-w-[200px]">
                                    {estimate.project?.title || estimate.title || "Untitled Project"}
                                </TableCell>
                                <TableCell className="font-medium text-emerald-400">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(estimate.totalCost)}
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        estimate.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            estimate.status === 'pending_payment' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-zinc-800 text-zinc-400 border-zinc-700'
                                    }>
                                        {estimate.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(estimate.proofUrl || (estimate.project?.order as any)?.proofUrl) ? (
                                        <ViewProofButton estimate={{
                                            ...estimate,
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            proofUrl: estimate.proofUrl || (estimate.project?.order as any)?.proofUrl || null
                                        }} />
                                    ) : (
                                        <span className="text-zinc-600 text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs">{estimate.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {estimate.status === 'pending_payment' && (
                                            <ConfirmPaymentButton estimateId={estimate.id} />
                                        )}
                                        <InvoiceDownloadButton
                                            estimate={{
                                                ...estimate,
                                                screens: (estimate.screens as unknown as { title: string, hours: number, description?: string }[] || []).map(s => ({ ...s, description: s.description || "" })),
                                                apis: (estimate.apis as unknown as { title: string, hours: number, description?: string }[] || []).map(a => ({ ...a, description: a.description || "" }))
                                            }}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
