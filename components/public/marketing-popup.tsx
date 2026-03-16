"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, Sparkles, CheckCircle2, Tag, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PopUp {
    id: string;
    headline: string;
    headline_id: string | null;
    description: string;
    description_id: string | null;
    ctaText: string | null;
    ctaText_id: string | null;
    ctaUrl: string | null;
    showFormLead: boolean;
    formHeadline: string | null;
    formHeadline_id: string | null;
    delay: number;
    couponCode: string | null;
    targetingType: string;
    targetingPaths: string[];
    targetingLocales: string[];
}

export function MarketingPopup() {
    const pathname = usePathname();
    const locale = useLocale();
    const [currentPopup, setCurrentPopup] = useState<PopUp | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const checkPopup = useCallback(async () => {
        try {
            const res = await fetch("/api/public/popups");
            const popups: PopUp[] = await res.json();

            // Find matching popup
            const match = popups.find((p) => {
                // Check locale
                if (p.targetingLocales.length > 0 && !p.targetingLocales.includes(locale)) {
                    return false;
                }

                // Check path
                if (p.targetingPaths.length > 0) {
                    const normalizedPath = pathname.replace(`/${locale}`, "") || "/";
                    const isPathMatch = p.targetingPaths.some(path => {
                        if (path === "/" && normalizedPath === "/") return true;
                        if (path !== "/" && normalizedPath.startsWith(path)) return true;
                        return false;
                    });
                    if (!isPathMatch) return false;
                }

                // Check session
                const dismissedAt = localStorage.getItem(`popup_dismissed_${p.id}`);
                if (dismissedAt) {
                    const diff = Date.now() - parseInt(dismissedAt);
                    if (diff < 1000 * 60 * 60 * 24) return false; // Show once per 24h
                }

                return true;
            });

            if (match) {
                setCurrentPopup(match);
                setTimeout(() => {
                    setIsVisible(true);
                }, match.delay * 1000);
            }
        } catch (error) {
            console.error("Failed to fetch popups:", error);
        }
    }, [pathname, locale]);

    useEffect(() => {
        checkPopup();
    }, [checkPopup]);

    const handleDismiss = () => {
        if (currentPopup) {
            localStorage.setItem(`popup_dismissed_${currentPopup.id}`, Date.now().toString());
        }
        setIsVisible(false);
    };

    const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get("name"),
            email: formData.get("email"),
            source: `popup_${currentPopup?.id}`,
            path: pathname,
            locale: locale,
        };

        try {
            const res = await fetch("/api/public/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setIsSubmitted(true);
                setTimeout(() => {
                    handleDismiss();
                }, 3000);
            } else {
                toast.error("Gagal mengirim data.");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setIsPending(false);
        }
    };

    const isId = locale === "id";
    const headline = (isId ? currentPopup?.headline_id : null) || currentPopup?.headline;
    const description = (isId ? currentPopup?.description_id : null) || currentPopup?.description;
    const ctaText = (isId ? currentPopup?.ctaText_id : null) || currentPopup?.ctaText;
    const formHeadline = (isId ? currentPopup?.formHeadline_id : null) || currentPopup?.formHeadline;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(isId ? "Kode kupon disalin!" : "Coupon code copied!");
    };

    if (!currentPopup) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:pt-16 pt-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -40 }}
                        className="relative w-full max-w-[90%] sm:max-w-md bg-[#09090b] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50"
                    >
                        {/* Custom Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-6 right-6 p-2 rounded-full border border-white/5 bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 md:p-8 space-y-5 relative">
                            {/* Decorative Icon */}
                            <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20 shadow-[0_0_20px_rgba(255,184,0,0.1)]">
                                <Sparkles className="w-6 h-6 text-brand-yellow" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight break-words">
                                    {headline}
                                </h2>
                                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                                    {description}
                                </p>
                            </div>

                            {/* Coupon Section */}
                            {currentPopup.couponCode && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="pt-2"
                                >
                                    <button 
                                        onClick={() => copyToClipboard(currentPopup.couponCode!)}
                                        className="w-full group relative flex flex-col items-center justify-center p-4 md:p-6 border-2 border-dashed border-brand-yellow/30 bg-brand-yellow/[0.03] rounded-2xl md:rounded-3xl hover:bg-brand-yellow/[0.06] hover:border-brand-yellow/50 transition-all overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-[#09090b] border border-white/10 rounded-full" />
                                        <div className="absolute top-0 right-0 w-6 h-6 translate-x-1/2 -translate-y-1/2 bg-[#09090b] border border-white/10 rounded-full" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 -translate-x-1/2 translate-y-1/2 bg-[#09090b] border border-white/10 rounded-full" />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 translate-x-1/2 translate-y-1/2 bg-[#09090b] border border-white/10 rounded-full" />
                                        
                                        <div className="flex items-center gap-2 mb-1">
                                            <Tag className="w-3 h-3 text-brand-yellow" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-brand-yellow transition-colors">
                                                {isId ? "Salin Kode" : "Copy Code"}
                                            </span>
                                        </div>
                                        <div className="text-xl md:text-2xl font-black text-white tracking-[0.3em] font-mono group-active:scale-95 transition-transform flex items-center gap-3">
                                            {currentPopup.couponCode}
                                            <Copy className="w-4 h-4 text-brand-yellow/40 group-hover:text-brand-yellow transition-colors" />
                                        </div>
                                    </button>
                                </motion.div>
                            )}

                            {currentPopup.showFormLead && !isSubmitted ? (
                                <form onSubmit={handleLeadSubmit} className="space-y-4 pt-2">
                                    {formHeadline && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow/60">
                                            {formHeadline}
                                        </p>
                                    )}
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <Input
                                            name="name"
                                            placeholder={isId ? "Nama Anda" : "Your Name"}
                                            required
                                            className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl text-white placeholder:text-zinc-600 focus-visible:ring-brand-yellow"
                                        />
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="Email"
                                            required
                                            className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl text-white placeholder:text-zinc-600 focus-visible:ring-brand-yellow"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full h-11 md:h-12 bg-white text-black hover:bg-brand-yellow rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all"
                                    >
                                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                {isId ? "Kirim Sekarang" : "Send Information"}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : isSubmitted ? (
                                <div className="py-8 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-black uppercase tracking-tight">Success!</p>
                                        <p className="text-zinc-500 text-xs">{isId ? "Terima kasih telah bergabung." : "Thank you for joining us."}</p>
                                    </div>
                                </div>
                            ) : ctaText && (
                                <Button
                                    asChild
                                    className="w-full h-12 md:h-14 bg-brand-yellow text-black hover:bg-white rounded-xl md:rounded-[1.25rem] font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-[0_4px_20px_rgba(255,255,0,0.2)]"
                                >
                                    <a href={currentPopup.ctaUrl || "#"}>
                                        {ctaText}
                                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                                    </a>
                                </Button>
                            )}

                            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold pt-4">
                                {isId ? "Klik di luar untuk menutup" : "Click outside to dismiss"}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
