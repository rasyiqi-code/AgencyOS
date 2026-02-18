import { getResendClient } from "./client";

/**
 * Escape karakter HTML untuk mencegah XSS di email templates.
 * Sanitasi input user sebelum dimasukkan ke HTML email.
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/** Alamat pengirim default */
const FROM_ADDRESS = "noreply@update.crediblemark.com";

/**
 * Kirim email notifikasi komisi baru ke affiliate.
 */
export async function sendCommissionEmail(
    toEmail: string,
    affiliateName: string,
    amount: number,
    orderId: string
): Promise<void> {
    const resend = await getResendClient();
    if (!resend) return;

    const safeAffiliateName = escapeHtml(affiliateName);
    const safeOrderId = escapeHtml(orderId);

    await resend.emails.send({
        from: `AgencyOS Partner <${FROM_ADDRESS}>`,
        to: [toEmail],
        subject: `💰 New Commission Earned: $${amount.toFixed(2)}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #10b981;">New Commission Earned!</h2>
                <p>Hi ${safeAffiliateName},</p>
                <p>Great news! You just earned a new commission:</p>
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                    <p style="margin: 8px 0 0;"><strong>Order:</strong> ${safeOrderId}</p>
                    <p style="margin: 8px 0 0;"><strong>Status:</strong> Pending</p>
                </div>
                <p>Keep sharing your referral link to earn more!</p>
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— AgencyOS Partner Program</p>
            </div>
        `
    });
}

/**
 * Kirim email notifikasi payout disetujui.
 */
export async function sendPayoutApprovedEmail(
    toEmail: string,
    affiliateName: string,
    amount: number
): Promise<void> {
    const resend = await getResendClient();
    if (!resend) return;

    const safeAffiliateName = escapeHtml(affiliateName);

    await resend.emails.send({
        from: `AgencyOS Partner <${FROM_ADDRESS}>`,
        to: [toEmail],
        subject: `✅ Payout Approved: $${amount.toFixed(2)}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #10b981;">Payout Approved!</h2>
                <p>Hi ${safeAffiliateName},</p>
                <p>Your payout request has been approved:</p>
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                    <p style="margin: 8px 0 0;"><strong>Status:</strong> Approved ✅</p>
                </div>
                <p>The funds will be transferred to your registered bank account shortly.</p>
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— AgencyOS Partner Program</p>
            </div>
        `
    });
}

/**
 * Kirim email notifikasi payout ditolak.
 */
export async function sendPayoutRejectedEmail(
    toEmail: string,
    affiliateName: string,
    amount: number,
    reason?: string
): Promise<void> {
    const resend = await getResendClient();
    if (!resend) return;

    const safeAffiliateName = escapeHtml(affiliateName);
    const safeReason = reason ? escapeHtml(reason) : undefined;

    await resend.emails.send({
        from: `AgencyOS Partner <${FROM_ADDRESS}>`,
        to: [toEmail],
        subject: `Payout Request Update: $${amount.toFixed(2)}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #ef4444;">Payout Request Rejected</h2>
                <p>Hi ${safeAffiliateName},</p>
                <p>Unfortunately, your payout request was not approved:</p>
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                    ${safeReason ? `<p style="margin: 8px 0 0;"><strong>Reason:</strong> ${safeReason}</p>` : ""}
                </div>
                <p>If you have questions, please contact our support team.</p>
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— AgencyOS Partner Program</p>
            </div>
        `
    });
}
