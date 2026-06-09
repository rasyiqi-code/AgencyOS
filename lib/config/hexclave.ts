import { HexclaveServerApp, HexclaveClientApp } from "@hexclave/tanstack-start";
import { unstable_cache } from "../cache";

// Client app — runs in the browser; no secret key exposed
export const hexclaveClientApp = new HexclaveClientApp({
    projectId: import.meta.env.VITE_HEXCLAVE_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || process.env.HEXCLAVE_PROJECT_ID,
    tokenStore: "cookie",
    redirectMethod: "window",
    urls: {
        default: {
            type: "hosted",
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

