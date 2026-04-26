import { Resend } from "resend";
import { getSettingValue } from "@/lib/server/settings";

/**
 * Shared helper to get an initialized Resend client.
 * Priority:
 * 1. Database System Setting (RESEND_API_KEY)
 * 2. Environment Variable (RESEND_API_KEY)
 * 
 * Returns null if no key is configured.
 */
export async function getResendClient(): Promise<Resend | null> {
    try {
        // 1. Try DB first
        // ⚡ Bolt Optimization: Use getSettingValue for RESEND_API_KEY
        // 🎯 Why: Reduces database queries during email initialization by utilizing unstable_cache
        // 📊 Impact: Eliminates a database lookup per email sent
        const dbApiKey = await getSettingValue("RESEND_API_KEY");

        // 2. Fallback to Env
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
 * Helper to get the Admin Email Target.
 * Priority:
 * 1. Database System Setting (ADMIN_EMAIL_TARGET)
 * 2. Environment Variable (ADMIN_EMAIL)
 * 3. Default fallback
 */
export async function getAdminEmailTarget(): Promise<string> {
    try {
        // ⚡ Bolt Optimization: Use getSettingValue for ADMIN_EMAIL_TARGET
        // 🎯 Why: Reduces database queries when fetching admin email target by utilizing unstable_cache
        // 📊 Impact: Eliminates a database lookup per admin notification
        const dbAdminEmail = await getSettingValue("ADMIN_EMAIL_TARGET");

        return dbAdminEmail || process.env.ADMIN_EMAIL || "support@crediblemark.com";
    } catch {
        return process.env.ADMIN_EMAIL || "support@crediblemark.com";
    }
}
