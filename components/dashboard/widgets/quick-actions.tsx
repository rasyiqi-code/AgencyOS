import Link from "next/link";
import { Calculator, CreditCard, LifeBuoy, Zap } from "lucide-react";

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/price-calculator" className="group">
                <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-500 group-hover:scale-110 transition-transform shrink-0">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">Calculator</h4>
                        <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">New Estimate</p>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/missions" className="group">
                <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shrink-0">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">Invoices</h4>
                        <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">View Orders</p>
                    </div>
                </div>
            </Link>

            <Link href="/squad" className="group">
                <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform shrink-0">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">Squad</h4>
                        <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">Hire Talent</p>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/inbox" className="group">
                <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shrink-0">
                        <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">Support</h4>
                        <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">Get Help</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
