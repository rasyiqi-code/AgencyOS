import { getResendClient } from "./client";

const FROM_ADDRESS = "noreply@update.crediblemark.com";

/**
 * Escape HTML characters to prevent XSS.
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Send email to client when their payment is successfully confirmed.
 */
export async function sendPaymentSuccessEmail(data: {
    to: string;
    customerName: string;
    orderId: string;
    amount: number;
    productName: string;
}) {
    const resend = await getResendClient();
    if (!resend) return;

    const safeName = escapeHtml(data.customerName);
    const safeProduct = escapeHtml(data.productName);

    await resend.emails.send({
        from: `AgencyOS <${FROM_ADDRESS}>`,
        to: [data.to],
        subject: `✅ Payment Confirmed: ${safeProduct}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #10b981;">Payment Confirmed!</h2>
                <p>Hi ${safeName},</p>
                <p>We've successfully confirmed your payment for <strong>${safeProduct}</strong>.</p>
                
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 8px 0 0;"><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
                    <p style="margin: 8px 0 0;"><strong>Status:</strong> PAID ✅</p>
                </div>

                <p>Our team is now processing your request. You can check the status on your dashboard.</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #10b981; text-decoration: none; font-weight: bold;">Go to Dashboard →</a></p>
                
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— The AgencyOS Team</p>
            </div>
        `
    });
}

/**
 * Send email to client when their order is cancelled.
 */
export async function sendOrderCancelledEmail(data: {
    to: string;
    customerName: string;
    orderId: string;
    productName: string;
}) {
    const resend = await getResendClient();
    if (!resend) return;

    const safeName = escapeHtml(data.customerName);
    const safeProduct = escapeHtml(data.productName);

    await resend.emails.send({
        from: `AgencyOS <${FROM_ADDRESS}>`,
        to: [data.to],
        subject: `Order Cancelled: ${safeProduct}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #ef4444;">Order Cancelled</h2>
                <p>Hi ${safeName},</p>
                <p>Your order for <strong>${safeProduct}</strong> has been cancelled.</p>
                
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 8px 0 0;"><strong>Status:</strong> CANCELLED</p>
                </div>

                <p>If you have any questions or think this was a mistake, please contact our support.</p>
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— The AgencyOS Team</p>
            </div>
        `
    });
}

/**
 * Send email to client when their payment is reverted to unpaid.
 */
export async function sendPaymentRevertedEmail(data: {
    to: string;
    customerName: string;
    orderId: string;
    productName: string;
}) {
    const resend = await getResendClient();
    if (!resend) return;

    const safeName = escapeHtml(data.customerName);
    const safeProduct = escapeHtml(data.productName);

    await resend.emails.send({
        from: `AgencyOS <${FROM_ADDRESS}>`,
        to: [data.to],
        subject: `Payment Status Update: ${safeProduct}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #f59e0b;">Payment Status Update</h2>
                <p>Hi ${safeName},</p>
                <p>Your payment status for <strong>${safeProduct}</strong> has been updated to <strong>PENDING</strong>.</p>
                
                <p>Our team may require additional verification or there was an issue with the previous confirmation.</p>
                
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 8px 0 0;"><strong>Status:</strong> PENDING PAYMENT</p>
                </div>

                <p>If you have already paid, please ensure you have uploaded the correct proof of payment.</p>
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— The AgencyOS Team</p>
            </div>
        `
    });
}

/**
 * Send email to client when their project status is updated.
 */
export async function sendProjectStatusUpdateEmail(data: {
    to: string;
    customerName: string;
    projectId: string;
    projectTitle: string;
    newStatus: string;
}) {
    const resend = await getResendClient();
    if (!resend) return;

    const safeName = escapeHtml(data.customerName);
    const safeTitle = escapeHtml(data.projectTitle);
    const safeStatus = data.newStatus.toUpperCase();

    // Map status to user-friendly labels
    const statusLabels: Record<string, string> = {
        "QUEUE": "In Queue 🕒",
        "DEV": "In Development 🛠️",
        "REVIEW": "In Review 👀",
        "DONE": "Completed ✅"
    };

    const displayStatus = statusLabels[safeStatus] || safeStatus;

    await resend.emails.send({
        from: `AgencyOS <${FROM_ADDRESS}>`,
        to: [data.to],
        subject: `Project Update: ${safeTitle} is now ${displayStatus}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #2563eb;">Project Update</h2>
                <p>Hi ${safeName},</p>
                <p>The status of your project <strong>${safeTitle}</strong> has been updated:</p>
                
                <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Project ID:</strong> ${data.projectId}</p>
                    <p style="margin: 8px 0 0;"><strong>New Status:</strong> ${displayStatus}</p>
                </div>

                <p>You can track the progress and view details on your project workbench.</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${data.projectId}" style="color: #2563eb; text-decoration: none; font-weight: bold;">View Project Workbench →</a></p>
                
                <p style="color: #71717a; font-size: 12px; margin-top: 24px;">— The AgencyOS Team</p>
            </div>
        `
    });
}

/**
 * Send invoice email to client with quote details and payment link.
 */
export async function sendInvoiceEmail(data: {
    to: string;
    customerName: string;
    invoiceId: string;
    serviceName: string;
    amount: number;
    currency: string;
    paymentLink?: string;
    screens?: { title: string; description: string; hours: number }[];
    apis?: { title: string; description: string; hours: number }[];
}) {
    const resend = await getResendClient();
    if (!resend) return { success: false, error: "Resend not configured" };

    const safeName = escapeHtml(data.customerName);
    const safeService = escapeHtml(data.serviceName);
    const currencySymbol = data.currency === 'IDR' ? 'Rp' : 'US$';
    const formattedAmount = data.currency === 'IDR'
        ? data.amount.toLocaleString('id-ID')
        : data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Build line items HTML from screens & APIs
    const lineItems = [
        ...(data.screens || []).map(s => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7;">${escapeHtml(s.title)}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; color: #71717a;">${escapeHtml(s.description)}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right;">${s.hours}h</td>
            </tr>
        `),
        ...(data.apis || []).map(a => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7;">${escapeHtml(a.title)}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; color: #71717a;">${escapeHtml(a.description)}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right;">${a.hours}h</td>
            </tr>
        `)
    ].join('');

    const lineItemsSection = lineItems ? `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <thead>
                <tr style="background: #f4f4f5;">
                    <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Item</th>
                    <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Description</th>
                    <th style="padding: 8px 12px; text-align: right; font-weight: 600;">Hours</th>
                </tr>
            </thead>
            <tbody>${lineItems}</tbody>
        </table>
    ` : '';

    const paymentButton = data.paymentLink ? `
        <div style="text-align: center; margin: 24px 0;">
            <a href="${data.paymentLink}" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                Proceed to Payment →
            </a>
        </div>
    ` : '';

    try {
        await resend.emails.send({
            from: `AgencyOS <${FROM_ADDRESS}>`,
            to: [data.to],
            subject: `📋 Invoice: ${safeService} — ${currencySymbol}${formattedAmount}`,
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
                    <div style="border-bottom: 3px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
                        <h1 style="margin: 0; font-size: 24px; color: #18181b;">Invoice</h1>
                        <p style="margin: 4px 0 0; color: #71717a; font-size: 13px;">Invoice ID: ${data.invoiceId}</p>
                    </div>

                    <p>Hi ${safeName},</p>
                    <p>Thank you for your interest! Here are the details of your quote for <strong>${safeService}</strong>:</p>

                    ${lineItemsSection}

                    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="font-weight: 600; color: #18181b;">Service</td>
                                <td style="text-align: right;">${safeService}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; color: #18181b; padding-top: 8px; font-size: 18px;">Total</td>
                                <td style="text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">${currencySymbol}${formattedAmount}</td>
                            </tr>
                        </table>
                    </div>

                    ${paymentButton}

                    <p style="color: #71717a; font-size: 12px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                        This invoice was generated automatically. If you have any questions, please reply to this email or contact our support team.
                        <br>— The AgencyOS Team
                    </p>
                </div>
            `
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send invoice email:", error);
        return { success: false, error: String(error) };
    }
}
