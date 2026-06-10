import { ArrowUpRight, Wallet } from "lucide-react";
import { type Order } from "@prisma/client";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface FinanceWidgetProps {
    totalInvestment: number;
    nextInvoice: Order | null;
}

export function FinanceWidget({ totalInvestment, nextInvoice }: FinanceWidgetProps) {
    return (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Financial Overview</span>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Total Investment</p>
                    <h3 className="text-xl font-black text-white tracking-tighter">
                        <PriceDisplay amount={totalInvestment} />
                    </h3>
                </div>

                {nextInvoice ? (
                    <div className="p-3 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold text-brand-yellow uppercase tracking-widest">Next Invoice</span>
                            <span className="text-[9px] text-zinc-500 uppercase">Pending</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-base font-black text-white tracking-tighter">
                                <PriceDisplay amount={nextInvoice.amount} />
                            </span>
                            <div className="w-5 h-5 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                                <ArrowUpRight className="w-3 h-3 text-brand-yellow" />
                            </div>
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
