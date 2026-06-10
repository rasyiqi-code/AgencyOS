import { Calculator, CreditCard, LifeBuoy, Zap } from "lucide-react";

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a href="/price-calculator" className="group">
                <div className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-500 group-hover:scale-110 transition-transform shrink-0">
                        <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Calculator</h4>
                        <p className="text-[9px] text-zinc-500 uppercase font-medium tracking-wider">New Estimate</p>
                    </div>
                </div>
            </a>

            <a href="/dashboard/missions" className="group">
                <div className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shrink-0">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Invoices</h4>
                        <p className="text-[9px] text-zinc-500 uppercase font-medium tracking-wider">View Orders</p>
                    </div>
                </div>
            </a>

            <a href="/squad" className="group">
                <div className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform shrink-0">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Squad</h4>
                        <p className="text-[9px] text-zinc-500 uppercase font-medium tracking-wider">Hire Talent</p>
                    </div>
                </div>
            </a>

            <a href="/dashboard/inbox" className="group">
                <div className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shrink-0">
                        <LifeBuoy className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Support</h4>
                        <p className="text-[9px] text-zinc-500 uppercase font-medium tracking-wider">Get Help</p>
                    </div>
                </div>
            </a>
        </div>
    );
}
