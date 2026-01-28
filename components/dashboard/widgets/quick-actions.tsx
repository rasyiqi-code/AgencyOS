import Link from "next/link";
import { Calculator, CreditCard, LifeBuoy, Zap } from "lucide-react";

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 gap-3">
            <Link href="/price-calculator" className="group">
                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-500 group-hover:scale-110 transition-transform">
                        <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">Calculator</h4>
                        <p className="text-xs text-zinc-500">New Estimate</p>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/missions" className="group">
                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">Invoices</h4>
                        <p className="text-xs text-zinc-500">View Orders</p>
                    </div>
                </div>
            </Link>

            <Link href="/squad" className="group">
                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">Squad</h4>
                        <p className="text-xs text-zinc-500">Hire Talent</p>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/inbox" className="group">
                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors h-full flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <LifeBuoy className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">Support</h4>
                        <p className="text-xs text-zinc-500">Get Help</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
