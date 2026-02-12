import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextRequest, NextResponse } from "next/server";
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail } from "@/lib/email/affiliate-emails";

/**
 * PATCH /api/admin/affiliates/payout
 * Admin approve/reject payout request.
 * Body: { requestId, action: "approved" | "rejected", notes? }
 */
export async function PATCH(req: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Admin check: cek ADMIN_EMAILS dan SUPER_ADMIN_ID
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { requestId, action, notes } = body as {
            requestId: string;
            action: "approved" | "rejected";
            notes?: string;
        };

        if (!requestId || !["approved", "rejected"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const payoutReq = await prisma.payoutRequest.findUnique({
            where: { id: requestId },
            include: { affiliate: true }
        });

        if (!payoutReq) {
            return NextResponse.json({ error: "Payout request not found" }, { status: 404 });
        }

        if (payoutReq.status !== "pending") {
            return NextResponse.json({ error: "This request has already been processed" }, { status: 400 });
        }

        if (action === "approved") {
            // Approve: update request + tambah paidEarnings di profile
            await prisma.$transaction([
                prisma.payoutRequest.update({
                    where: { id: requestId },
                    data: { status: "approved", notes, processedAt: new Date() }
                }),
                prisma.affiliateProfile.update({
                    where: { id: payoutReq.affiliateId },
                    data: { paidEarnings: { increment: payoutReq.amount } }
                }),
                // Update status komisi yang terkait dengan request ini (semua yang pending SEBELUM request dibuat)
                prisma.commissionLog.updateMany({
                    where: {
                        affiliateId: payoutReq.affiliateId,
                        status: "pending",
                        createdAt: { lte: payoutReq.createdAt }
                    },
                    data: {
                        status: "paid",
                        paidAt: new Date()
                    }
                })
            ]);

            // Kirim email notifikasi (non-blocking)
            sendPayoutApprovedEmail(payoutReq.affiliate.email, payoutReq.affiliate.name, payoutReq.amount)
                .catch(err => console.error("Email send failed:", err));

        } else {
            // Rejected
            await prisma.payoutRequest.update({
                where: { id: requestId },
                data: { status: "rejected", notes, processedAt: new Date() }
            });

            // Kirim email notifikasi (non-blocking)
            sendPayoutRejectedEmail(payoutReq.affiliate.email, payoutReq.affiliate.name, payoutReq.amount, notes)
                .catch(err => console.error("Email send failed:", err));
        }

        return NextResponse.json({ success: true, action });
    } catch (error) {
        console.error("Admin Payout Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * GET /api/admin/affiliates/payout
 * Admin: Ambil semua payout requests.
 */
export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Admin check: cek ADMIN_EMAILS dan SUPER_ADMIN_ID
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const requests = await prisma.payoutRequest.findMany({
            include: { affiliate: { select: { name: true, email: true, referralCode: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error("Admin Payout List Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
