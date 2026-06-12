import { Terminal } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none font-mono">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 flex items-center gap-3 shadow-2xl shadow-black/50">
                <Terminal className="w-4 h-4 text-brand-yellow animate-pulse" />
                <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">Initializing System...</span>
            </div>
        </div>
    );
}
