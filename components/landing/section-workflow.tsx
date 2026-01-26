import { MessageSquare, Calculator, MousePointerClick } from "lucide-react";

export function Workflow() {
    return (
        <section className="py-24 bg-zinc-950 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Tanpa Drama. Tanpa Meeting. Langsung Kerja.
                    </h2>
                    <p className="text-zinc-400">Efisiensi workflow asynchronous untuk hasil maksimal.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-blue-500 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <MessageSquare className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">1. Chat dengan CredibleBot</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Ceritakan ide Anda pada AI kami. Dia akan menyusun spesifikasi teknis (PRD) yang rapi untuk Anda.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-indigo-500 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                <Calculator className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">2. Terima Penawaran Instan</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Sistem menghitung kompleksitas fitur dan memberikan harga pasti (Fixed Price). Bayar deposit aman via Midtrans.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center">
                            <div className="w-24 h-24 mx-auto bg-black border-4 border-purple-500 rounded-full flex items-center justify-center relative z-10 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                <MousePointerClick className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">3. Pantau & Revisi Visual</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Lihat progres di dashboard. Ada revisi? Cukup klik bagian yang ingin diubah. Saya kerjakan, Anda terima beres.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
