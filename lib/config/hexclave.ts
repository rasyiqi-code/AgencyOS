import { HexclaveServerApp } from "@hexclave/tanstack-start";
import { unstable_cache } from "../cache";

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
        revalidate: 300, // cache 5 menit
        tags: ["hexclave-users"],
    }
);

