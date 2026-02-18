import { getResendClient, getAdminEmailTarget } from "./client";

const FROM_ADDRESS = "notifications@update.crediblemark.com";

/**
 * Send notification when a new Estimate/Quote is generated via Price Calculator.
 */
export async function notifyNewEstimate(data: {
    id: string;
    title: string;
    totalCost: number;
    creatorName: string;
}) {
    const resend = await getResendClient();
    const adminEmail = await getAdminEmailTarget();
    if (!resend) return;

    await resend.emails.send({
        from: `AgencyOS Bot <${FROM_ADDRESS}>`,
        to: adminEmail,
        subject: `[New Quote] ${data.title} ($${data.totalCost})`,
        html: `
            <h3>New Estimate Generated</h3>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Cost:</strong> $${data.totalCost}</p>
            <p><strong>By:</strong> ${data.creatorName}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/estimate/${data.id}">View Estimate</a></p>
        `
    });
}

/**
 * Send notification when a Service Order (Project) is initiated.
 */
export async function notifyNewServiceOrder(data: {
    clientName: string;
    serviceTitle: string;
    estimateId: string;
    price: number;
}) {
    const resend = await getResendClient();
    const adminEmail = await getAdminEmailTarget();
    if (!resend) return;

    await resend.emails.send({
        from: `AgencyOS Bot <${FROM_ADDRESS}>`,
        to: adminEmail,
        subject: `[New Service Order] ${data.serviceTitle} from ${data.clientName}`,
        html: `
            <h3>New Service Order Initiated</h3>
            <p><strong>Client:</strong> ${data.clientName}</p>
            <p><strong>Service:</strong> ${data.serviceTitle}</p>
            <p><strong>Price:</strong> $${data.price}</p>
            <p>Waiting for payment...</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/finance/orders">View Orders</a></p>
        `
    });
}

/**
 * Send notification when a Digital Product Order is created.
 */
export async function notifyNewDigitalOrder(data: {
    orderId: string;
    productName: string;
    customerEmail: string;
    amount: number;
}) {
    const resend = await getResendClient();
    const adminEmail = await getAdminEmailTarget();
    if (!resend) return;

    await resend.emails.send({
        from: `AgencyOS Bot <${FROM_ADDRESS}>`,
        to: adminEmail,
        subject: `[New Digital Order] ${data.productName} (${data.orderId})`,
        html: `
            <h3>New Digital Product Order</h3>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Customer:</strong> ${data.customerEmail}</p>
            <p><strong>Amount:</strong> $${data.amount}</p>
            <p>Status: PENDING</p>
        `
    });
}

/**
 * Send notification when ANY payment is successfully settled.
 */
export async function notifyPaymentSuccess(data: {
    orderId: string;
    amount: number; // in USD
    customerName?: string;
    type: "SERVICE" | "DIGITAL";
}) {
    const resend = await getResendClient();
    const adminEmail = await getAdminEmailTarget();
    if (!resend) return;

    await resend.emails.send({
        from: `AgencyOS Bot <${FROM_ADDRESS}>`,
        to: adminEmail,
        subject: `💰 Payment Received: $${data.amount.toFixed(2)} (${data.type})`,
        html: `
            <h2 style="color: #10b981;">Payment Received!</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Customer:</strong> ${data.customerName || "Guest"}</p>
            <p><strong>Type:</strong> ${data.type}</p>
        `
    });
}

/**
 * Send notification when a new Affiliate registers.
 */
export async function notifyNewAffiliate(data: {
    name: string;
    email: string;
    code: string;
}) {
    const resend = await getResendClient();
    const adminEmail = await getAdminEmailTarget();
    if (!resend) return;

    await resend.emails.send({
        from: `AgencyOS Bot <${FROM_ADDRESS}>`,
        to: adminEmail,
        subject: `[New Affiliate] ${data.name} just joined!`,
        html: `
            <h3>New Affiliate Registered</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Referral Code:</strong> ${data.code}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/marketing/affiliates">Manage Affiliates</a></p>
        `
    });
}

/**
 * Send notification when a new Support Ticket or Chat is created.
 */
export async function notifyNewSupportTicket(data: {
    id: string;
    type: "chat" | "ticket";
    name: string;
    email: string;
    message: string;
}) {
    const resend = await getResendClient();
    const adminEmail = await getAdminEmailTarget();
    if (!resend) return;

    const typeLabel = data.type === 'chat' ? 'Live Chat' : 'Support Ticket';

    await resend.emails.send({
        from: `AgencyOS Bot <${FROM_ADDRESS}>`,
        to: adminEmail,
        subject: `[New ${typeLabel}] from ${data.name}`,
        html: `
            <h3>New ${typeLabel} Created</h3>
            <p><strong>From:</strong> ${data.name} (${data.email})</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 12px; font-style: italic;">
                ${data.message}
            </blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support">View Inbox</a></p>
        `
    });
}
