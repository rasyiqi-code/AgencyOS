"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useLocale } from "next-intl";

export function PushNotificationBanner() {
    const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();
    const [isVisible, setIsVisible] = useState(false);
    const locale = useLocale();
    const isId = locale === "id";

    useEffect(() => {
        // Show only if supported, not subscribed, and permission is not denied
        if (isSupported && !isSubscribed && permission !== "denied") {
            const shown = localStorage.getItem("push_banner_shown");
            const lastShown = shown ? parseInt(shown) : 0;
            const now = Date.now();

            // Show after 15 seconds, and once every 3 days if dismissed
            if (now - lastShown > 1000 * 60 * 60 * 24 * 3) {
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 15000);
                return () => clearTimeout(timer);
            }
        }
    }, [isSupported, isSubscribed, permission]);

    const handleSubscribe = async () => {
        const sub = await subscribe();
        if (sub) {
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("push_banner_shown", Date.now().toString());
    };

    if (!isSupported || isSubscribed || permission === "denied") return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 z-50 md:w-[400px]"
                >
                    <div className="relative overflow-hidden group bg-[#09090b] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6">
                        {/* Background Decorative Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow via-white to-brand-yellow/20" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center">
                                <BellRing className="w-6 h-6 text-brand-yellow animate-pulse" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                    {isId ? "Jangan Lewatkan Tips!" : "Don't Miss Out!"}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Dapatkan info produk baru, diskon eksklusif, dan tips bisnis langsung di browser Anda."
                                        : "Get new product info, exclusive discounts, and business tips directly in your browser."}
                                </p>

                                <div className="pt-2 flex gap-3">
                                    <Button
                                        onClick={handleSubscribe}
                                        className="h-10 px-6 bg-brand-yellow text-black hover:bg-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        {isId ? "Aktifkan" : "Enable"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDismiss}
                                        className="h-10 px-4 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest"
                                    >
                                        {isId ? "Nanti Saja" : "Maybe Later"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Micro-features list */}
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                <Check className="w-3 h-3 text-brand-yellow" />
                                {isId ? "Edukasi Bisnis" : "Business Tips"}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                <Check className="w-3 h-3 text-brand-yellow" />
                                {isId ? "Update Invoice" : "Invoice Updates"}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
