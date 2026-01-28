
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { prisma } from "@/lib/db";
// import { getResendKey, getAdminTargetEmail } from "@/app/actions/email";

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

        // 1. Try to get key from DB
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: ["RESEND_API_KEY", "ADMIN_EMAIL_TARGET"] } }
        });

        let apiKey = settings.find(s => s.key === "RESEND_API_KEY")?.value || null;

        // 2. Fallback to Env if DB is empty
        if (!apiKey) {
            apiKey = process.env.RESEND_API_KEY || null;
        }

        if (!apiKey) {
            return NextResponse.json({ error: "System configuration error: Email service not active." }, { status: 503 });
        }

        // 3. Fetch target email
        const targetEmail = settings.find(s => s.key === "ADMIN_EMAIL_TARGET")?.value || null;
        const recipient = targetEmail || process.env.ADMIN_EMAIL || "support@crediblemark.com";

        const resend = new Resend(apiKey);

        const { error } = await resend.emails.send({
            from: "AgencyOS Contact <onboarding@resend.dev>",
            to: [recipient],
            replyTo: email,
            subject: `[Contact Form] ${subject} - ${firstName} ${lastName}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, "<br>")}</p>
            `,
        });

        if (error) {
            console.error("Resend Error:", error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
