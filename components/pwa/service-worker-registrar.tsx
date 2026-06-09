"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Komponen client-side untuk mendaftarkan Service Worker.
 * Menangani lifecycle: registrasi, update detection, dan notifikasi update.
 *
 * Komponen ini tidak merender UI apapun (return null),
 * tetapi mengelola side effects SW di background.
 */
export function ServiceWorkerRegistrar() {
    useEffect(() => {
        // Jangan jalankan Service Worker di mode development
        if (process.env.NODE_ENV === "development") {
            return;
        }

        // Cek dukungan browser
        if (!("serviceWorker" in navigator)) {
            return;
        }

        // Referensi interval untuk cleanup saat unmount
        let updateInterval: ReturnType<typeof setInterval> | null = null;

        /**
         * Mendaftarkan service worker dan setup listener update.
         */
        async function registerServiceWorker(): Promise<void> {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });

                // Cek update saat pertama kali
                registration.update();

                // Listener: SW baru ditemukan (update available)
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener("statechange", () => {
                        // SW baru sudah terinstall dan siap diaktifkan
                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            // Ada versi baru — tampilkan notifikasi ke user
                            showUpdateNotification(registration);
                        }
                    });
                });

                // Periodic update check (setiap 1 jam) — disimpan untuk cleanup
                updateInterval = setInterval(
                    () => {
                        registration.update();
                    },
                    60 * 60 * 1000
                );
            } catch (error) {
                console.error("[PWA] Gagal mendaftarkan Service Worker:", error);
            }
        }

        // Jalankan registrasi setelah halaman benar-benar selesai loading
        if (document.readyState === "complete") {
            registerServiceWorker();
        } else {
            window.addEventListener("load", registerServiceWorker);
        }

        // Cleanup: hapus event listener dan interval saat unmount
        return () => {
            window.removeEventListener("load", registerServiceWorker);
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        };
    }, []);

    return null;
}

/**
 * Menampilkan toast notifikasi bahwa ada versi aplikasi baru.
 * User bisa klik untuk langsung update.
 */
function showUpdateNotification(
    registration: ServiceWorkerRegistration
): void {
    toast("Versi baru tersedia!", {
        description: "Klik untuk memperbarui aplikasi.",
        duration: Infinity,
        action: {
            label: "Perbarui",
            onClick: () => {
                // Kirim pesan ke SW baru untuk skip waiting
                const waitingWorker = registration.waiting;
                if (waitingWorker) {
                    waitingWorker.postMessage({ type: "SKIP_WAITING" });
                }
                // Reload halaman setelah SW baru aktif
                window.location.reload();
            },
        },
    });
}

