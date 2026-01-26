import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code2, ShieldCheck, Zap } from "lucide-react";

export function LandingHero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center justify-center">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-black">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial Gradient overlay */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
                <div className="absolute right-0 bottom-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-10 blur-[120px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center space-y-8 relative">

                    {/* Floating Decorative Elements */}
                    <div className="absolute -top-12 -left-12 hidden md:block animate-pulse duration-[4s]">
                        <div className="bg-zinc-900/80 border border-white/10 p-3 rounded-2xl backdrop-blur-md rotate-[-6deg]">
                            <Code2 className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 -right-12 hidden md:block animate-pulse duration-[5s] delay-700">
                        <div className="bg-zinc-900/80 border border-white/10 p-3 rounded-2xl backdrop-blur-md rotate-[12deg]">
                            <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                    </div>

                    {/* Status Widget */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500 mb-4 hover:bg-blue-500/20 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Status: Limited Availability (2 Slots Left)
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-[1.1]">
                        Build Enterprise Apps <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x bg-[length:200%_auto]">
                            At Startup Speed
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Stop trading quality for speed. We fuse <span className="text-white font-semibold">Generative AI</span> velocity with <span className="text-white font-semibold">Senior Engineering</span> rigor to deliver secure, scalable software in weeks, not months.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 pt-4">
                        <Link href="/dashboard">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transition-all">
                                Launch Dashboard
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/squad">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50 rounded-full transition-all backdrop-blur-sm">
                                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                                Join Talent Squad
                            </Button>
                        </Link>
                    </div>

                    {/* Tech Stack Hints */}
                    <div className="pt-12 flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Simple text or icons for "Trusted by" effect could go here */}
                        <span className="text-xs font-mono tracking-widest text-zinc-500">POWERED BY NEXT.JS 15 • TURBOPACK • GENKIT</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

