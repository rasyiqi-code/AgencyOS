import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/config/stack';

/**
 * Escape karakter HTML untuk mencegah XSS di email templates.
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
    try {
        // Auth check: hanya user login yang boleh mengirim email schedule
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, notes, estimateTitle, totalCost, totalHours, link } = body;

        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error("RESEND_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const resendClient = new Resend(apiKey);

        // Sanitasi semua input user sebelum masuk ke HTML email
        const safeName = escapeHtml(name || "");
        const safeEmail = escapeHtml(email || "");
        const safePhone = escapeHtml(phone || "");
        const safeNotes = escapeHtml(notes || "No notes provided.");
        const safeTitle = escapeHtml(estimateTitle || "");
        const safeLink = escapeHtml(link || "");

        const { data, error } = await resendClient.emails.send({
            from: 'AgencyOS <onboarding@resend.dev>',
            to: ['hello@crediblemark.com', 'crediblemarkofficial@gmail.com'],
            subject: `New Lead: ${safeName} - ${safeTitle}`,
            html: `
                <h1>New Consultation Request</h1>
                <p><strong>Project:</strong> ${safeTitle}</p>
                <p><strong>Est. Cost:</strong> $${totalCost}</p>
                <p><strong>Est. Hours:</strong> ${totalHours}h</p>
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
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Email Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
