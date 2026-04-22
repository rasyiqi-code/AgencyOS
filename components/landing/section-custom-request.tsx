"use client";

import { Calculator, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFloatingChat } from "@/lib/store/floating-chat-store";
import { ScrollAnimationWrapper } from "@/components/ui/scroll-animation-wrapper";
import { useParams } from "next/navigation";

export function SectionCustomRequest() {
    const t = useTranslations("CustomCTA");
    const { setIsMenuOpen } = useFloatingChat();
    const params = useParams();
    const locale = params?.locale as string || "id";

    return (
        <section className="py-12 sm:py-16 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,215,0,0.03),transparent_70%)] pointer-events-none" />
            <div className="container mx-auto px-4 relative z-10">
                <ScrollAnimationWrapper>
                    <div className="max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/5 shadow-2xl text-center relative overflow-hidden group">
                        {/* Decorative elements */}
                        <div className="absolute -top-24 -right-24 w-40 h-40 bg-brand-yellow/5 blur-[80px] group-hover:bg-brand-yellow/10 transition-colors duration-700" />
                        
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
                                {t("title")}
                            </h2>
                            <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                                {t("description")}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                <Button
                                    asChild
                                    size="default"
                                    className="w-full sm:w-auto h-12 px-6 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Link href={`/${locale}/price-calculator`}>
                                        <Calculator className="w-4 h-4" />
                                        {t("calculator")}
                                    </Link>
                                </Button>
                                
                                <Button
                                    onClick={() => setIsMenuOpen(true)}
                                    variant="outline"
                                    size="default"
                                    className="w-full sm:w-auto h-12 px-6 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4 text-brand-yellow" />
                                    {t("contact")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollAnimationWrapper>
            </div>
        </section>
    );
}
