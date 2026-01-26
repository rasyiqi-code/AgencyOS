import { Terminal, Database, Cloud, Code2, Zap, Lock } from "lucide-react";

export function SocialProof() {
    return (
        <section className="py-10 border-y border-white/5 bg-black">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 items-center text-center">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-blue-400 font-bold text-3xl">
                            <Zap className="w-6 h-6" />
                            <span>2x Faster</span>
                        </div>
                        <p className="text-zinc-500 text-sm">Dibanding Agensi Konvensional</p>
                    </div>
                    <div className="space-y-2 border-x border-white/5">
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-3xl">
                            <span>Fixed Price</span>
                        </div>
                        <p className="text-zinc-500 text-sm">Tanpa Biaya Tersembunyi</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-3xl">
                            <Lock className="w-6 h-6" />
                            <span>100% Verified</span>
                        </div>
                        <p className="text-zinc-500 text-sm">Kode Diaudit Senior Expert</p>
                    </div>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Powered by Modern Tech Stack</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple text placeholders for logos as lucide icons are limited for brands */}
                        <div className="flex items-center gap-2 text-zinc-300 font-bold">
                            <Code2 className="w-5 h-5" /> Next.js
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 font-bold">
                            <Cloud className="w-5 h-5" /> Vercel
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 font-bold">
                            <Database className="w-5 h-5" /> Supabase
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 font-bold">
                            <Terminal className="w-5 h-5" /> OpenAI
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
