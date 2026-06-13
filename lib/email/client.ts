import { Resend } from "resend";
import { getSystemSettings } from "@/lib/server/settings";

/**
 * Helper untuk menginisialisasi Resend client.
 * Prioritas:
 * 1. Database System Setting (RESEND_API_KEY) — via cache unstable_cache
 * 2. Environment Variable (RESEND_API_KEY)
 * 
 * Mengembalikan null jika API key tidak dikonfigurasi.
 */
export async function getResendClient(): Promise<Resend | null> {
    try {
        // ⚡ Optimasi: Gunakan getSystemSettings yang ter-cache (TTL 1 jam)
        // untuk menghindari query DB langsung setiap kali kirim email
        const settings = await getSystemSettings(["RESEND_API_KEY"]);
        const dbApiKey = settings.find(s => s.key === "RESEND_API_KEY")?.value;

        // Fallback ke Environment Variable
        const apiKey = dbApiKey || process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.warn("Resend API key not configured in DB or Env. Email sending disabled.");
            return null;
        }

        return new Resend(apiKey);
    } catch (error) {
        console.error("Failed to initialize Resend client:", error);
        return null; // Fail gracefully
    }
}

/**
 * Helper untuk mendapatkan alamat email target Admin.
 * Prioritas:
 * 1. Database System Setting (ADMIN_EMAIL_TARGET) — via cache unstable_cache
 * 2. Environment Variable (ADMIN_EMAIL)
 * 3. Fallback default
 */
export async function getAdminEmailTarget(): Promise<string> {
    try {
        // ⚡ Optimasi: Gunakan getSystemSettings yang ter-cache (TTL 1 jam)
        const settings = await getSystemSettings(["ADMIN_EMAIL_TARGET"]);
        const dbEmail = settings.find(s => s.key === "ADMIN_EMAIL_TARGET")?.value;

        return dbEmail || process.env.ADMIN_EMAIL || "support@crediblemark.com";
    } catch {
        return process.env.ADMIN_EMAIL || "support@crediblemark.com";
    }
}

/**
 * Helper untuk mendapatkan konfigurasi pengirim email (Sender Name & Email).
 * Prioritas:
 * 1. Database System Setting (RESEND_SENDER_NAME & RESEND_SENDER_EMAIL)
 * 2. Fallback default
 */
export async function getSenderConfig(): Promise<{ name: string; email: string; formatted: string }> {
    try {
        const settings = await getSystemSettings(["RESEND_SENDER_NAME", "RESEND_SENDER_EMAIL"]);
        const name = settings.find(s => s.key === "RESEND_SENDER_NAME")?.value || "Crediblemark Bot";
        const email = settings.find(s => s.key === "RESEND_SENDER_EMAIL")?.value || "notifications@update.crediblemark.com";

        return {
            name,
            email,
            formatted: `${name} <${email}>`
        };
    } catch {
        return {
            name: "Crediblemark Bot",
            email: "notifications@update.crediblemark.com",
            formatted: "Crediblemark Bot <notifications@update.crediblemark.com>"
        };
    }
}
