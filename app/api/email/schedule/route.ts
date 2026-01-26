import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Ideally: const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, notes, estimateTitle, totalCost, totalHours, link } = body;

        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error("RESEND_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const resendClient = new Resend(apiKey);

        const { data, error } = await resendClient.emails.send({
            from: 'AgencyOS <onboarding@resend.dev>', // Default Resend testing domain or configured domain
            to: ['hello@crediblemark.com', 'crediblemarkofficial@gmail.com'],
            subject: `New Lead: ${name} - ${estimateTitle}`,
            html: `
                <h1>New Consultation Request</h1>
                <p><strong>Project:</strong> ${estimateTitle}</p>
                <p><strong>Est. Cost:</strong> $${totalCost}</p>
                <p><strong>Est. Hours:</strong> ${totalHours}h</p>
                <p><a href="${link}">View Estimate Link</a></p>
                
                <hr />
                
                <h2>Client Details</h2>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${phone}</li>
                </ul>
                
                <h3>Notes:</h3>
                <p>${notes || "No notes provided."}</p>
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
