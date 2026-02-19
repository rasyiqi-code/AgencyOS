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
        // Hanya register di production atau jika sw.js tersedia
        if (!("serviceWorker" in navigator)) {
            console.log("[PWA] Service Worker tidak didukung browser ini");
            return;
        }

        registerServiceWorker();
    }, []);

    return null;
}

/**
 * Mendaftarkan service worker dan setup listener update.
 */
async function registerServiceWorker(): Promise<void> {
    try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
        });

        console.log("[PWA] Service Worker terdaftar, scope:", registration.scope);

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

        // Periodic update check (setiap 1 jam)
        setInterval(
            () => {
                registration.update();
            },
            60 * 60 * 1000
        );
    } catch (error) {
        console.error("[PWA] Gagal mendaftarkan Service Worker:", error);
    }
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
