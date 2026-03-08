import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { stackServerApp } from "@/lib/config/stack";
import { sendInvoiceEmail } from "@/lib/email/client-notifications";
import { ScreenItem, ApiItem } from "@/lib/shared/types";
import { broadcastPushNotification } from "@/lib/server/push";

/**
 * POST /api/invoices/send
 * Mengirim invoice penawaran ke email klien via Resend.
 * Body: { estimateId: string }
 * Hanya bisa dipanggil oleh admin.
 */
export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { estimateId } = body;

        if (!estimateId) {
            return NextResponse.json({ error: "estimateId is required" }, { status: 400 });
        }

        const estimate = await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
                service: true,
                project: true,
            }
        });

        if (!estimate) {
            return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
        }

        // Resolve user email from Stack Auth or project data
        const userId = estimate.project?.userId || estimate.userId;
        if (!userId) {
            return NextResponse.json({ error: "No associated user found for this estimate" }, { status: 400 });
        }

        const stackUser = await stackServerApp.getUser(userId);
        if (!stackUser?.primaryEmail) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        const customerName = stackUser.displayName
            || estimate.project?.clientName
            || stackUser.primaryEmail.split('@')[0]
            || "Client";

        const currency = estimate.service?.currency || 'USD';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Link pembayaran mengarah ke halaman quotes klien
        const paymentLink = estimate.project
            ? `${appUrl}/dashboard/quotes`
            : undefined;


        const result = await sendInvoiceEmail({
            to: stackUser.primaryEmail,
            customerName,
            invoiceId: `#${estimateId.slice(-8).toUpperCase()}`,
            serviceName: estimate.service?.title || estimate.title || "Service",
            amount: estimate.totalCost,
            currency,
            paymentLink,
            screens: (estimate.screens || []) as ScreenItem[],
            apis: (estimate.apis || []) as ApiItem[],
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
        }

        // Trigger Push Notification (Tujuannya follow-up invoice)
        // Kita kirim ke semua subscribers karena targetnya guest/pendaftar umum yang mungkin lupa checkout
        await broadcastPushNotification([], {
            title: "Invoice Baru Terbit! 📄",
            body: `Invoice #${estimateId.slice(-8).toUpperCase()} untuk ${estimate.service?.title || "layanan kami"} telah dikirim ke email Anda.`,
            url: paymentLink || `${appUrl}/products`
        }).catch(err => console.error("Auto Push Invoice Error:", err));

        return NextResponse.json({ success: true, message: `Invoice sent to ${stackUser.primaryEmail}` });
    } catch (error) {
        console.error("Send Invoice Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
