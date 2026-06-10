import { HexclaveServerApp } from "@hexclave/tanstack-start";
import { hexclaveClientApp } from "./hexclave-client";
import { unstable_cache } from "../cache";

import "./env-loader";

// Server app — hanya diinstansiasi di sisi server untuk melindungi secret key
export const hexclaveServerApp = typeof window === "undefined"
    ? new HexclaveServerApp({
        secretServerKey: process.env.STACK_SECRET_SERVER_KEY || process.env.HEXCLAVE_SECRET_SERVER_KEY,
        inheritsFrom: hexclaveClientApp,
      })
    : {} as HexclaveServerApp;

// Cache daftar user selama 5 menit untuk mencegah bottleneck download massal user dari auth provider eksternal
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


