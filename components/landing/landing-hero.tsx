import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import Image from "next/image";

export async function LandingHero() {
    const t = await getTranslations("Hero");

    // Fetch Agency Name
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center justify-center">
            {/* ... (background remains same) ... */}
            <div className="absolute inset-0 bg-black">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial Gradient overlay */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
                <div className="absolute right-0 bottom-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-10 blur-[120px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <div className="space-y-8 text-left max-w-2xl">
                        {/* Status Widget */}
                        <Link href="/price-calculator">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500 mb-4 hover:bg-brand-yellow/20 transition-colors cursor-pointer w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                                </span>
                                {t("statusBadge", { brand: agencyName })}
                            </div>
                        </Link>

                        <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-[1.1]">
                            {t("title1")} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow animate-gradient-x bg-[length:200%_auto]">
                                {t("title2")}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            {t.rich("description", {
                                white: (chunks) => <span className="text-white font-semibold">{chunks}</span>,
                                brand: agencyName
                            })}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 pt-4">
                            <Link href="/price-calculator">
                                <Button size="lg" className="h-14 px-8 text-lg bg-brand-yellow text-black hover:bg-brand-yellow/90 rounded-full font-bold shadow-[0_0_20px_rgba(254,215,0,0.3)] hover:shadow-[0_0_35px_rgba(254,215,0,0.5)] transition-all">
                                    {t("launchDashboard")}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/services">
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-brand-yellow/10 hover:text-brand-yellow hover:border-brand-yellow/50 rounded-full transition-all backdrop-blur-sm">
                                    <Zap className="w-4 h-4 mr-2 text-brand-yellow" />
                                    {t("viewServices")}
                                </Button>
                            </Link>
                        </div>

                        {/* Tech Stack Hints */}
                        <div className="pt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 flex lg:justify-start">
                            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">{t("poweredBy")}</span>
                        </div>
                    </div>

                    {/* Right Column: Expert Asset */}
                    <div className="relative hidden lg:block animate-in fade-in zoom-in-95 duration-1000 delay-500">
                        {/* Background Glows for the Model */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/10 blur-[120px] rounded-full z-0" />

                        <div className="relative w-full h-[600px] xl:h-[800px] z-10 flex items-end justify-center">
                            {/* Improved fade/blur from waist down */}
                            <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />

                            {/* Secondary sharp fade at the very bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-black z-30 pointer-events-none" />

                            <Image
                                src="/expert.png"
                                alt="Expert Model"
                                fill
                                unoptimized
                                className="object-contain object-bottom drop-shadow-[0_-20px_50px_rgba(254,215,0,0.1)] relative z-10"
                                priority
                            />

                            {/* Floating AI Model Badges with Authentic Icons - Central Ring */}
                            <div className="absolute top-[15%] -left-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[5s] z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/openai.png" alt="OpenAI" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">OpenAI</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">GPT-4o</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-[42%] -left-12 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[7s] delay-700 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/gemini.png" alt="Google Gemini" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Google</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Gemini 1.5</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-[8%] right-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[6s] delay-1000 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/claude.png" alt="Anthropic Claude" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Anthropic</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Claude 3.5</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-[45%] -right-8 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[8s] delay-500 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/deepseek.png" alt="DeepSeek" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">DeepSeek</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">V3 Architecture</div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Ring - New Models */}
                            <div className="absolute top-[25%] -right-12 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[9s] delay-1500 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/llama.png" alt="Meta Llama" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Meta</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Llama 3.1</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-[25%] -right-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[6.5s] delay-200 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/mistral.png" alt="Mistral AI" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Mistral</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Mistral Large</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-[65%] -left-16 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[11s] delay-800 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/perplexityai.png" alt="Perplexity AI" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Perplexity</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Sonar Large</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-[10%] -left-6 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[9.5s] delay-1000 z-30 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/huggingface.png" alt="Hugging Face" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">HuggingFace</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Open Models</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-[2%] left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[12s] delay-1200 z-50 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/grok.png" alt="xAI Grok" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">xAI</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Grok-2</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-[15%] right-[10%] bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[8.5s] delay-1400 z-30 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500 flex items-center justify-center bg-zinc-800">
                                        <Image src="/brands/groq.svg" alt="Groq" width={18} height={18} className="object-contain" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Groq</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">LPU Inference</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-[30%] -right-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[7.5s] delay-1600 z-30 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500">
                                        <Image src="/brands/cohere.png" alt="Cohere" fill unoptimized className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Cohere</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Command R+</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-[60%] -left-8 bg-white/5 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl animate-bounce duration-[10.5s] delay-1800 z-30 hidden xl:block shadow-2xl group/badge transition-transform hover:scale-110">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500 flex items-center justify-center bg-zinc-800">
                                        <Image src="/brands/aya.svg" alt="Aya" width={18} height={18} className="object-contain" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">Aya</div>
                                        <div className="text-[11px] font-bold text-white leading-none mt-0.5">Multi-lingual</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

