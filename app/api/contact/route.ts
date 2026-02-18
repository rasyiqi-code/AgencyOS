
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getResendClient, getAdminEmailTarget } from "@/lib/email/client";

// Reusing schema definition
const contactSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedFields = contactSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json({
                error: "Validation failed",
                fieldErrors: validatedFields.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { firstName, lastName, email, subject, message } = validatedFields.data;

        // 1. Get Resend Client
        const resend = await getResendClient();

        if (!resend) {
            return NextResponse.json({ error: "System configuration error: Email service not active." }, { status: 503 });
        }

        // 2. Get Target Email
        const recipient = await getAdminEmailTarget();

        // Use verified domain or fallback
        const fromAddress = "noreply@update.crediblemark.com";

        // Sanitasi HTML untuk mencegah XSS di email
        const escapeHtml = (str: string) =>
            str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const safeFirstName = escapeHtml(firstName);
        const safeLastName = escapeHtml(lastName);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

        const { error } = await resend.emails.send({
            from: `AgencyOS Contact <${fromAddress}>`,
            to: [recipient],
            replyTo: email,
            subject: `[Contact Form] ${safeSubject} - ${safeFirstName} ${safeLastName}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${safeFirstName} ${safeLastName} (${safeEmail})</p>
                <p><strong>Subject:</strong> ${safeSubject}</p>
                <hr />
                <h3>Message:</h3>
                <p>${safeMessage}</p>
            `,
        });

        if (error) {
            console.error("Resend Error:", error);
            // Return specific error message for debugging
            return NextResponse.json({
                error: error.message || "Failed to send email",
                details: error
            }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
