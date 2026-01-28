"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FileText, CreditCard } from "lucide-react";
import Link from "next/link";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";
import "@/types/payment"; // Import for Window.snap type augmentation

export interface BillingOrder {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    snapToken: string | null;
    project: {
        title: string;
        invoiceId: string | null;
    } | null;
}

interface BillingHistoryProps {
    orders: BillingOrder[];
}

export function BillingHistory({ orders }: BillingHistoryProps) {
    const handlePay = (snapToken: string) => {
        // Trigger Midtrans Popup
        if (window.snap) {
            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    console.log('payment success!', result);
                    window.location.reload();
                },
                onPending: function (result) {
                    console.log('wating your payment!', result);
                },
                onError: function (result) {
                    console.log('payment failed!', result);
                },
                onClose: function () {
                    console.log('customer closed the popup without finishing the payment');
                }
            });
        } else {
            console.error("Midtrans Snap not loaded");
        }
    };

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-950/50">
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Date</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Description</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Invoice ID</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Amount</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Status</TableHead>
                        <TableHead className="text-right text-xs uppercase tracking-wider text-zinc-500 font-medium">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableCell colSpan={6} className="h-32 text-center text-zinc-500 text-sm">
                                No billing history found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => (
                            <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="text-zinc-400 text-sm font-mono">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-zinc-200 font-medium">
                                    {order.project?.title || "Project Deposit"}
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs font-mono">
                                    {order.id}
                                </TableCell>
                                <TableCell className="text-zinc-200 font-medium">
                                    <PriceDisplay amount={order.amount} />
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "uppercase text-[10px] tracking-wider font-normal h-5 border-0",
                                            order.status === 'paid' || order.status === 'settled'
                                                ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/20"
                                                : order.status === 'pending'
                                                    ? "bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20"
                                                    : "bg-zinc-800 text-zinc-400 ring-1 ring-inset ring-zinc-700/50"
                                        )}
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {(order.status === 'pending' && order.snapToken) ? (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-black border-0"
                                                onClick={() => handlePay(order.snapToken!)}
                                            >
                                                <CreditCard className="w-3 h-3 mr-1.5" />
                                                Pay Now
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
                                                asChild
                                            >
                                                <Link href={`/invoices/${order.id}${order.snapToken ? `?token=${order.snapToken}` : ''}`} target="_blank">
                                                    <FileText className="w-3 h-3 mr-1.5" />
                                                    View Invoice
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
