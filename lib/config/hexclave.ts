import { HexclaveServerApp, HexclaveClientApp } from "@hexclave/tanstack-start";
import { unstable_cache } from "../cache";

// Inisialisasi untuk sisi browser/client
export const hexclaveClientApp = new HexclaveClientApp({
    projectId: import.meta.env.VITE_HEXCLAVE_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || process.env.HEXCLAVE_PROJECT_ID,
    tokenStore: "cookie",
    redirectMethod: "window",
});

// Inisialisasi untuk sisi server (server functions) secara aman agar tidak crash di browser
export const hexclaveServerApp = typeof window === "undefined"
    ? new HexclaveServerApp({ tokenStore: "cookie" })
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

