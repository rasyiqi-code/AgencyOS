import { Check, X, Info } from "lucide-react";

export function FinancialLogic() {
    return (
        <section className="py-24 bg-zinc-950 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Hemat Biaya, Bukan Kualitas.
                    </h2>
                    <p className="text-zinc-400">Smart Investment logic untuk bisnis modern.</p>
                </div>

                <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
                    <div className="grid grid-cols-3 bg-white/5 border-b border-white/10 text-sm font-bold text-white p-4">
                        <div className="text-zinc-500">PERBANDINGAN</div>
                        <div className="text-center text-zinc-400">HIRE SENIOR DEV</div>
                        <div className="text-center text-blue-400">CREDIBLEMARK (HYBRID)</div>
                    </div>

                    {/* Row 1: Cost */}
                    <div className="grid grid-cols-3 p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                        <div className="font-medium text-zinc-300">Biaya / Gaji</div>
                        <div className="text-center text-red-400">
                            <div className="font-bold text-lg">Rp 180 Jt+</div>
                            <div className="text-xs text-zinc-500">Gaji 15jt/bln x 12</div>
                        </div>
                        <div className="text-center text-emerald-400">
                            <div className="font-bold text-lg">Rp 15 - 30 Jt</div>
                            <div className="text-xs text-emerald-500/70">One-time payment</div>
                        </div>
                    </div>

                    {/* Row 2: Time */}
                    <div className="grid grid-cols-3 p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                        <div className="font-medium text-zinc-300">Waktu Hiring</div>
                        <div className="text-center text-zinc-400">
                            <div className="flex items-center justify-center gap-2">
                                <X className="w-4 h-4 text-red-500" />
                                1 - 2 Bulan
                            </div>
                        </div>
                        <div className="text-center text-white">
                            <div className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4 text-blue-500" />
                                Langsung Mulai
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Hidden Cost */}
                    <div className="grid grid-cols-3 p-6 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                        <div className="font-medium text-zinc-300 flex items-center gap-1">
                            Hidden Cost <Info className="w-3 h-3 text-zinc-600" />
                        </div>
                        <div className="text-center text-zinc-400">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-red-400 text-sm">THR, BPJS, Laptop, Pajak</span>
                            </div>
                        </div>
                        <div className="text-center text-white">
                            <div className="font-bold text-emerald-400">Rp 0</div>
                        </div>
                    </div>

                    {/* Row 4: Risk */}
                    <div className="grid grid-cols-3 p-6 items-center hover:bg-white/5 transition-colors bg-blue-500/5">
                        <div className="font-medium text-zinc-300">Risiko Utama</div>
                        <div className="text-center text-zinc-400">
                            <div className="text-sm text-red-400">Karyawan Resign tiba-tiba</div>
                        </div>
                        <div className="text-center text-white">
                            <div className="text-sm text-blue-200 font-medium">Garansi Bug & Maintenance</div>
                            <div className="text-[10px] text-zinc-500 mt-1">ROI: Efisien & Cepat</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
