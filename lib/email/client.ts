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
        // ⚡ Bolt Optimization: Replace direct DB query with cached getSettingValue
        // 🎯 Why: Frequent email initialization shouldn't hit the DB directly when cached settings are available
        // 📊 Impact: Eliminates a blocking DB query from the email sending path
        // 1. Try DB first (cached) or fallback to env
        const apiKey = await getSettingValue("RESEND_API_KEY", process.env.RESEND_API_KEY || "");

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
        // ⚡ Bolt Optimization: Use getSettingValue for caching instead of raw prisma query
        // 🎯 Why: Avoids unnecessary database reads for static configuration
        // 📊 Impact: Saves 1 database query per admin email sent
        const fallback = process.env.ADMIN_EMAIL || "support@crediblemark.com";
        return await getSettingValue("ADMIN_EMAIL_TARGET", fallback);
    } catch {
        return process.env.ADMIN_EMAIL || "support@crediblemark.com";
    }
}
