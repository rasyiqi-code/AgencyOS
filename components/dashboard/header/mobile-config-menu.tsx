"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Settings2, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/shared/utils";

/**
 * MobileConfigMenu - Komponen inline switcher Bahasa & Mata Uang untuk Mobile Header.
 * Menggantikan gaya Dropdown popover lama dengan animasi inline expand horizontal yang premium.
 */
export function MobileConfigMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { currency, setCurrency } = useCurrency();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    // Mengambil locale saat ini dari path (misal: 'en' atau 'id')
    const currentLocale = pathname?.split('/')[1]?.length === 2 ? pathname.split('/')[1] : 'en';

    const changeLanguage = (newLocale: string) => {
        if (newLocale === currentLocale) return;

        const segments = pathname?.split('/') || [];
        if (segments[1]?.length === 2) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }

        const newPath = segments.join('/') || '/';
        const queryString = searchParams?.toString();
        const newPathWithParams = queryString ? `${newPath}?${queryString}` : newPath;

        startTransition(() => {
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
            router.push(newPathWithParams);
            router.refresh();
        });
    };

    return (
        <div className="relative flex items-center justify-end h-9">
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-white hover:bg-white/10 h-9 w-9 rounded-xl"
                            onClick={() => setIsOpen(true)}
                        >
                            <Settings2 className="h-5 w-5" />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, width: 0, x: 20 }}
                        animate={{ opacity: 1, width: "auto", x: 0 }}
                        exit={{ opacity: 0, width: 0, x: 20 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="flex items-center gap-2 bg-zinc-900 border border-white/5 p-1 rounded-xl shadow-2xl overflow-hidden shrink-0"
                    >
                        {/* Selector Bahasa */}
                        <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/5">
                            <button
                                onClick={() => changeLanguage("en")}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wide cursor-pointer",
                                    currentLocale === "en"
                                        ? "bg-brand-yellow text-black"
                                        : "text-zinc-400 hover:text-white"
                                )}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage("id")}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wide cursor-pointer",
                                    currentLocale === "id"
                                        ? "bg-brand-yellow text-black"
                                        : "text-zinc-400 hover:text-white"
                                )}
                            >
                                ID
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-4 w-px bg-white/10 shrink-0" />

                        {/* Selector Currency */}
                        <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/5">
                            <button
                                onClick={() => setCurrency("USD")}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wide cursor-pointer",
                                    currency === "USD"
                                        ? "bg-brand-yellow text-black"
                                        : "text-zinc-400 hover:text-white"
                                )}
                            >
                                USD
                            </button>
                            <button
                                onClick={() => setCurrency("IDR")}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wide cursor-pointer",
                                    currency === "IDR"
                                        ? "bg-brand-yellow text-black"
                                        : "text-zinc-400 hover:text-white"
                                )}
                            >
                                IDR
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all shrink-0 ml-1 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
