import { LayoutDashboard, Users, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SectionEcosystem() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        The Agency Operating System
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Three powerful interfaces connected by one intelligent core.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Client Portal */}
                    <Link href="/dashboard" className="group block h-full">
                        <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <LayoutDashboard className="w-24 h-24 text-blue-500 rotate-12" />
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Client Command Center</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                Generate specs with AI, track real-time progress, and deploy instantly. No more emails.
                            </p>

                            <div className="flex items-center text-blue-400 text-sm font-bold mt-auto">
                                Enter Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Squad Portal */}
                    <Link href="/squad" className="group block h-full">
                        <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-green-500/50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users className="w-24 h-24 text-green-500 rotate-12" />
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Talent Squad Engine</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                Pick up missions, access clear specs, and submit code. Get paid for output, not hours.
                            </p>

                            <div className="flex items-center text-green-400 text-sm font-bold mt-auto">
                                Join Squad <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Admin Core */}
                    <div className="group block h-full select-none cursor-default opacity-80 hover:opacity-100 transition-opacity">
                        <div className="relative h-full p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck className="w-24 h-24 text-purple-500 rotate-12" />
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Admin Core</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                The central brain managing quality control, payments, and system integrity.
                            </p>

                            <div className="flex items-center text-purple-500/50 text-sm font-bold mt-auto">
                                Restricted Access <ShieldCheck className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
