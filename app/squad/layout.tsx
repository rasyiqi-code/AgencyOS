import Link from "next/link";
import { Terminal, Code2, ShieldAlert, Cpu } from "lucide-react";

export default function SquadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-black font-mono text-green-500 selection:bg-green-500/20">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-green-500/20 bg-black sm:flex">
                <div className="flex h-16 items-center px-6 border-b border-green-500/20">
                    <Link href="/squad" className="flex items-center gap-2 font-bold tracking-tighter">
                        <Terminal className="h-5 w-5" />
                        <span>SQUAD_OS v1.0</span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-2 px-3 py-6">
                    <div className="px-3 mb-2 text-xs font-bold uppercase tracking-widest text-green-700">
                        ../MISSIONS
                    </div>
                    <Link
                        href="/squad"
                        className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-green-600 transition-all hover:border-green-500 hover:text-green-400 hover:bg-green-500/5 group"
                    >
                        <Code2 className="h-4 w-4" />
                        <span className="group-hover:translate-x-1 transition-transform"> Mission_Board</span>
                    </Link>
                    <Link
                        href="/squad/active"
                        className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-green-600 transition-all hover:border-green-500 hover:text-green-400 hover:bg-green-500/5 group"
                    >
                        <Cpu className="h-4 w-4" />
                        <span className="group-hover:translate-x-1 transition-transform"> Active_Protocol</span>
                    </Link>

                    <div className="px-3 mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-green-700">
                        ../SYSTEM
                    </div>
                    <Link
                        href="/squad/profile"
                        className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-green-600 transition-all hover:border-green-500 hover:text-green-400 hover:bg-green-500/5 group"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        <span className="group-hover:translate-x-1 transition-transform"> Operative_Data</span>
                    </Link>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:pl-64">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-green-500/20 bg-black/90 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <div className="w-full h-full flex items-center justify-between">
                        <div className="text-xs text-green-800 animate-pulse">
                            SYSTEM STATUS: ONLINE
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <span>[ USER: GHOST ]</span>
                        </div>
                    </div>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
