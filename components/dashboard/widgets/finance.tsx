import { ArrowUpRight, Wallet } from "lucide-react";
import { type Order } from "@prisma/client";

interface FinanceWidgetProps {
    totalInvestment: number;
    nextInvoice: Order | null;
}

export function FinanceWidget({ totalInvestment, nextInvoice }: FinanceWidgetProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Financial Overview</span>
                </div>
                <button className="text-xs text-brand-yellow hover:text-brand-yellow/80">Manage</button>
            </div>

            <div className="space-y-6">
                <div>
                    <p className="text-sm text-zinc-500 mb-1">Total Investment</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(totalInvestment)}</h3>
                </div>

                {nextInvoice ? (
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-emerald-400">Next Invoice</span>
                            <span className="text-xs text-emerald-500/70">Pending Payment</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">{formatCurrency(nextInvoice.amount)}</span>
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-zinc-800/20 border border-white/5">
                        <p className="text-xs text-zinc-500 text-center">No pending invoices</p>
                    </div>
                )}
            </div>
        </div>
    );
}
