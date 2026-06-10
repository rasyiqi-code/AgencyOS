import { HexclaveServerApp } from "@hexclave/tanstack-start";
import { hexclaveClientApp } from "./hexclave-client";
import { unstable_cache } from "../cache";

// Muat variabel lingkungan jika di sisi server menggunakan Top-Level Await
if (typeof window === "undefined") {
  const dotenv = await import("dotenv");
  const path = await import("path");
  
  // Muat .env.local terlebih dahulu (prioritas lebih tinggi) kemudian .env
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  
  console.log("DIAGNOSTIK SERVER - HEXCLAVE_SECRET_SERVER_KEY:", process.env.HEXCLAVE_SECRET_SERVER_KEY);
}

// Server app — hanya diinstansiasi di sisi server untuk melindungi secret key
export const hexclaveServerApp = typeof window === "undefined"
    ? new HexclaveServerApp({
        secretServerKey: process.env.HEXCLAVE_SECRET_SERVER_KEY || process.env.STACK_SECRET_SERVER_KEY,
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


