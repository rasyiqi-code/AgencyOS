"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmPaymentButton } from "@/components/admin/orders/confirm-payment";
import { ViewProofButton } from "@/components/admin/orders/view-proof-button";
import { UnpaidButton } from "@/components/admin/orders/unpaid-button";
import { useCurrency } from "@/components/providers/currency-provider";

const PriceCell = ({ amount }: { amount: number }) => {
    const { currency, locale, rate } = useCurrency();
    let displayAmount = amount;
    // Basic logic: if base is USD (implied) and target is IDR, convert.
    // Assuming backend amount is always USD.
    if (currency === 'IDR') {
        displayAmount = amount * rate;
    }

    return (
        <>{new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(displayAmount)}</>
    );
};

export type FinanceData = {
    id: string;
    title: string | null;
    totalCost: number;
    status: string;
    proofUrl: string | null;
    createdAt: Date;
    project: {
        title: string;
        clientName: string | null;
        userId: string | null;
        order?: {
            proofUrl: string | null;
            paymentType: string | null;
        } | null;
    } | null;
    paymentType: string | null;
    screens: { title: string; description: string; hours: number }[];
    apis: { title: string; description: string; hours: number }[];
};

export const financeColumns: ColumnDef<FinanceData>[] = [
    {
        accessorKey: "id",
        header: "Invoice ID",
        size: 150,
        cell: ({ row }) => {
            const id = row.getValue("id") as string;
            const displayId = `#${id.slice(-8).toUpperCase()}`;
            return (
                <div className="flex items-center gap-1.5 group/id w-full overflow-hidden">
                    <span className="font-mono text-[11px] text-zinc-500 truncate flex-1 min-w-0" title={id}>
                        {displayId}
                    </span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(id);
                            toast.success("Order ID copied");
                        }}
                        className="opacity-0 group-hover/id:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all text-zinc-400 hover:text-white"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                </div>
            );
        },
    },
    {
        accessorKey: "project",
        header: "Project",
        size: 350,
        cell: ({ row }) => {
            const project = row.original.project;
            const title = project?.title || row.original.title || "Untitled Project";
            return (
                <div className="flex flex-col gap-0.5 leading-tight overflow-hidden">
                    <span className="font-medium text-white text-sm whitespace-nowrap truncate">{title}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "clientName",
        header: "Client Name",
        size: 200,
        cell: ({ row }) => {
            const project = row.original.project;
            const client = project?.clientName || "Direct Order";
            return (
                <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-white text-sm whitespace-nowrap truncate">{client}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "totalCost",
        header: "Amount",
        size: 120,
        cell: ({ row }) => {
            const amount = row.getValue("totalCost") as number;
            return (
                <div className="flex flex-col overflow-hidden">
                    <span className="font-mono font-medium text-emerald-400 text-[12px] whitespace-nowrap truncate">
                        <PriceCell amount={amount} />
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 140,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const isPaid = status === 'paid' || status === 'settled';
            const isPending = status === 'pending_payment' || status === 'pending';

            return (
                <Badge
                    variant="outline"
                    className={`py-0 px-2 h-5 text-[10px] w-fit flex items-center gap-1.5
                        ${isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            isPending ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'text-zinc-400 border-zinc-700'}
                    `}
                >
                    {isPaid ? <CheckCircle2 className="w-3 h-3" /> : null}
                    {status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            );
        },
    },
    {
        id: "proof",
        header: "Proof",
        size: 80,
        cell: ({ row }) => {
            const estimate = row.original;
            const proofUrl = estimate.proofUrl || estimate.project?.order?.proofUrl;
            return (
                <div className="flex items-center">
                    {proofUrl || estimate.paymentType ? (
                        <ViewProofButton estimate={{
                            ...estimate,
                            proofUrl: proofUrl as string,
                            paymentType: estimate.paymentType
                        }} />
                    ) : <span className="text-zinc-700 text-[10px] italic px-2">None</span>}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        size: 120,
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as Date;
            return <div className="text-zinc-500 text-[11px] whitespace-nowrap">{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: "actions",
        header: "",
        size: 48,
        enableResizing: false,
        cell: ({ row }) => {
            const estimate = row.original;

            const status = estimate.status;
            const isPaid = status === 'paid' || status === 'settled';
            const isPending = status === 'pending_payment';

            return (
                <div className="flex items-center justify-end gap-0">
                    {isPending && (
                        <div className="scale-75 origin-right">
                            <ConfirmPaymentButton estimateId={estimate.id} />
                        </div>
                    )}
                    {isPaid && (
                        <div className="scale-75 origin-right">
                            <UnpaidButton estimateId={estimate.id} />
                        </div>
                    )}
                </div>
            );
        },
    },
];
