import type { MetadataRoute } from "next";
import { getSystemSettings } from "@/lib/server/settings";

/**
 * Dynamic Web App Manifest menggunakan Next.js Metadata API.
 * Membaca nama dan deskripsi dari system settings database.
 *
 * Next.js akan otomatis menyajikan file ini di /manifest.webmanifest
 * dan menambahkan link tag di <head>.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
    // Ambil pengaturan agensi dari database
    const settings = await getSystemSettings([
        "AGENCY_NAME",
        "SEO_DESCRIPTION",
    ]);

    const agencyName =
        settings.find((s) => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const description =
        settings.find((s) => s.key === "SEO_DESCRIPTION")?.value ||
        "Senior Software House";

    return {
        name: agencyName,
        short_name: agencyName,
        description: description,
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#FFB800",
        orientation: "portrait-primary",
        categories: ["business", "productivity"],
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/maskable-icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
