"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

/**
 * Key localStorage untuk menyimpan preferensi dismiss install prompt.
 * Saat user dismiss, banner tidak muncul lagi selama 7 hari.
 */
const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

/**
 * Interface untuk event beforeinstallprompt.
 * Event ini dikirim browser saat aplikasi memenuhi kriteria PWA installable.
 */
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

/**
 * Komponen banner install prompt untuk PWA.
 * Menampilkan banner floating di bagian bawah layar
 * saat browser mendeteksi app bisa diinstall.
 *
 * Fitur:
 * - Intercept `beforeinstallprompt` event
 * - Animasi smooth menggunakan framer-motion
 * - Dismiss-able dengan persistensi localStorage (7 hari)
 * - Auto-hide setelah instalasi berhasil
 */
export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    /**
     * Cek apakah prompt sudah di-dismiss oleh user (dalam 7 hari terakhir).
     */
    const isDismissed = useCallback((): boolean => {
        try {
            const dismissed = localStorage.getItem(DISMISS_KEY);
            if (!dismissed) return false;

            const dismissedAt = parseInt(dismissed, 10);
            const now = Date.now();

            // Jika sudah lewat 7 hari, hapus dan tampilkan lagi
            if (now - dismissedAt > DISMISS_DURATION_MS) {
                localStorage.removeItem(DISMISS_KEY);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }, []);

    useEffect(() => {
        // Jangan tampilkan jika sudah di-dismiss
        if (isDismissed()) return;

        /**
         * Handler untuk event beforeinstallprompt.
         * Event ini di-intercept agar browser tidak menampilkan
         * prompt default, dan diganti dengan custom UI.
         */
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Tampilkan banner setelah delay singkat (UX lebih baik)
            setTimeout(() => setIsVisible(true), 2000);
        };

        /**
         * Handler saat app sudah terinstall.
         * Menyembunyikan banner dan membersihkan state.
         */
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsVisible(false);
            setDeferredPrompt(null);
            console.log("[PWA] Aplikasi berhasil diinstall!");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, [isDismissed]);

    /**
     * Trigger native install prompt saat user klik tombol Install.
     */
    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                console.log("[PWA] User menerima install prompt");
            } else {
                console.log("[PWA] User menolak install prompt");
            }
        } catch (error) {
            console.error("[PWA] Error saat menampilkan prompt:", error);
        } finally {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    /**
     * Dismiss banner dan simpan timestamp ke localStorage.
     */
    const handleDismiss = () => {
        setIsVisible(false);
        try {
            localStorage.setItem(DISMISS_KEY, Date.now().toString());
        } catch {
            // Ignore localStorage errors (private browsing, dll)
        }
    };

    // Tidak render jika sudah terinstall atau tidak visible
    if (isInstalled || !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
                >
                    <div
                        className="relative overflow-hidden rounded-2xl border border-zinc-800
              bg-zinc-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl"
                    >
                        {/* Aksen gradient di atas */}
                        <div
                            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r
                from-transparent via-amber-500/50 to-transparent"
                        />

                        <div className="flex items-start gap-3">
                            {/* Ikon install */}
                            <div
                                className="flex size-10 shrink-0 items-center justify-center
                  rounded-xl bg-amber-500/10"
                            >
                                <Download className="size-5 text-amber-500" />
                            </div>

                            {/* Konten */}
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-white">
                                    Install Aplikasi
                                </h3>
                                <p className="mt-0.5 text-xs text-zinc-400">
                                    Akses lebih cepat langsung dari home screen Anda.
                                </p>

                                {/* Tombol aksi */}
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={handleInstall}
                                        className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs
                      font-semibold text-black transition-all duration-200
                      hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25
                      active:scale-95"
                                    >
                                        Install
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="rounded-lg px-4 py-1.5 text-xs font-medium
                      text-zinc-400 transition-colors hover:text-white"
                                    >
                                        Nanti Saja
                                    </button>
                                </div>
                            </div>

                            {/* Tombol close */}
                            <button
                                onClick={handleDismiss}
                                className="shrink-0 rounded-lg p-1 text-zinc-500
                  transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                                aria-label="Tutup"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
