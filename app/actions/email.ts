"use server";

import { hexclaveServerApp } from "@/lib/config/hexclave";
import { getResendClient, getAdminEmailTarget } from "@/lib/email/client";

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function scheduleEmail(data: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    estimateTitle?: string;
    totalCost?: number;
    totalHours?: number;
    link?: string;
}) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const resendClient = await getResendClient();
    const adminEmail = await getAdminEmailTarget();

    if (!resendClient) {
        throw new Error("Server configuration error");
    }

    const safeName = escapeHtml(data.name || user.displayName || "Client");
    const safeEmail = escapeHtml(data.email || user.primaryEmail || "");
    const safePhone = escapeHtml(data.phone || "");
    const safeNotes = escapeHtml(data.notes || "No notes provided.");
    const safeTitle = escapeHtml(data.estimateTitle || "");
    const safeLink = escapeHtml(data.link || "");

    const { error } = await resendClient.emails.send({
        from: 'AgencyOS <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `New Lead: ${safeName} - ${safeTitle}`,
        html: `
            <h1>New Consultation Request</h1>
            <p><strong>Project:</strong> ${safeTitle}</p>
            <p><strong>Est. Cost:</strong> $${data.totalCost}</p>
            <p><strong>Est. Hours:</strong> ${data.totalHours}h</p>
            <p><a href="${safeLink}">View Estimate Link</a></p>

            <hr />

            <h2>Client Details</h2>
            <ul>
                <li><strong>Name:</strong> ${safeName}</li>
                <li><strong>Email:</strong> ${safeEmail}</li>
                <li><strong>Phone:</strong> ${safePhone}</li>
            </ul>

            <h3>Notes:</h3>
            <p>${safeNotes}</p>
        `
    });

    if (error) {
        console.error("Resend Error:", error);
        throw new Error("Failed to send email");
    }

    return { success: true };
}
