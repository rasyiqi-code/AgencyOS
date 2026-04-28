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
        // ⚡ Bolt Optimization: Use getSettingValue for Next.js unstable_cache
        // 🎯 Why: Replaces direct prisma query to reduce database load for email settings.
        // 📊 Impact: O(1) cache lookup instead of O(1) DB query for repeated emails.
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
        // ⚡ Bolt Optimization: Use getSettingValue for Next.js unstable_cache
        // 🎯 Why: Replaces direct prisma query to reduce database load for email settings.
        // 📊 Impact: O(1) cache lookup instead of O(1) DB query for repeated admin emails.
        const dbAdminEmail = await getSettingValue("ADMIN_EMAIL_TARGET");

        return dbAdminEmail || process.env.ADMIN_EMAIL || "support@crediblemark.com";
    } catch {
        return process.env.ADMIN_EMAIL || "support@crediblemark.com";
    }
}
