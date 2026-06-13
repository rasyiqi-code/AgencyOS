import { HexclaveServerApp } from "@hexclave/next";
import { unstable_cache } from "next/cache";

export const hexclaveServerApp = new HexclaveServerApp({
    tokenStore: "nextjs-cookie",
});

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
        revalidate: 3600, // cache 1 jam (mengurangi overhead RAM/bandwidth secara masif)
        tags: ["hexclave-users"],
    }
);

