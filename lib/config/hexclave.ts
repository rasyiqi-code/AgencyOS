import { HexclaveServerApp, HexclaveClientApp } from "@hexclave/tanstack-start";
import { unstable_cache } from "../cache";

// Client app — berjalan di browser; tidak mengekspos secret key server
export const hexclaveClientApp = new HexclaveClientApp({
    projectId: import.meta.env.VITE_HEXCLAVE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || process.env.HEXCLAVE_PROJECT_ID,
    publishableClientKey: import.meta.env.VITE_HEXCLAVE_PUBLISHABLE_CLIENT_KEY || import.meta.env.NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY || process.env.HEXCLAVE_PUBLISHABLE_CLIENT_KEY,
    tokenStore: "cookie",
    redirectMethod: "window",
    urls: {
        default: {
            // Menggunakan handler-component agar halaman auth dirender secara lokal oleh komponen <HexclaveHandler>
            type: "handler-component",
        },
    },
});

// Server app — only instantiated server-side to protect the secret key
export const hexclaveServerApp = typeof window === "undefined"
    ? new HexclaveServerApp({ inheritsFrom: hexclaveClientApp })
    : {} as HexclaveServerApp;

// Cache list user selama 5 menit untuk mencegah bottleneck download massal user auth provider eksternal
export const getCachedUsers = unstable_cache(
    async () => {
        try {
            return await hexclaveServerApp.listUsers();
        } catch (error) {
            console.error("Gagal mengambil daftar user dari Stack Auth:", error);
            return [];
        }
    },
    ["hexclave-all-users-list"],
    {
        revalidate: 300, // cache 5 menit
        tags: ["hexclave-users"],
    }
);

