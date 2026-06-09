"use server";

import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isAdmin, getCurrentUser } from "@/lib/shared/auth-helpers";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { getSystemSettings } from "@/lib/server/settings";
import { generateKey } from "@/lib/utils/crypto";
import { grantPermission, revokePermission } from "@/lib/server/admin-team";
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail } from "@/lib/email/affiliate-emails";

function serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

// ============================================================
// Admin Affiliates
// ============================================================

export async function getAffiliates(page = 1, limit = 50) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

    if (!isSuperAdmin) return { success: false, error: "Forbidden" };

    try {
        limit = Math.min(Math.max(limit, 1), 100);
        const skip = (page - 1) * limit;

        const aggregates = await prisma.affiliateProfile.aggregate({
            _sum: { paidEarnings: true, totalEarnings: true },
            _count: { id: true }
        });

        const totalPaid = aggregates._sum.paidEarnings || 0;
        const totalEarnings = aggregates._sum.totalEarnings || 0;
        const pendingPayouts = totalEarnings - totalPaid;
        const totalAffiliates = aggregates._count.id || 0;

        const affiliates = await prisma.affiliateProfile.findMany({
            include: {
                _count: { select: { referrals: true, commissions: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
        });

        const settings = await getSystemSettings(["affiliate_default_commission_rate", "RESEND_API_KEY"]);
        const defaultRate = parseFloat(settings.find((s: { key: string; value: string }) => s.key === "affiliate_default_commission_rate")?.value || "10");
        const resendKeyRaw = settings.find((s: { key: string; value: string }) => s.key === "RESEND_API_KEY")?.value;
        const resendApiKey = resendKeyRaw ? `${resendKeyRaw.substring(0, 4)}...${resendKeyRaw.substring(resendKeyRaw.length - 4)}` : "";

        return {
            success: true,
            data: serialize({ affiliates, stats: { totalAffiliates, totalPaid, pendingPayouts, totalEarnings }, defaultRate, resendApiKey })
        };
    } catch (error) {
        console.error("Admin Affiliates Error:", error);
        return { success: false, error: "Internal Error" };
    }
}

export async function updateAffiliate(id: string, commissionRate?: number, status?: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

    if (!isSuperAdmin) return { success: false, error: "Forbidden" };

    try {
        const updateData: Record<string, unknown> = {};

        if (commissionRate !== undefined) {
            if (commissionRate < 0 || commissionRate > 100) {
                return { success: false, error: "Commission rate must be between 0-100" };
            }
            updateData.commissionRate = commissionRate;
        }

        if (status !== undefined) {
            const validStatuses = ["pending", "active", "suspended"];
            if (!validStatuses.includes(status)) {
                return { success: false, error: `Status must be one of: ${validStatuses.join(", ")}` };
            }
            updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: "No valid fields to update" };
        }

        const updated = await prisma.affiliateProfile.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/marketing');
        return { success: true, data: serialize(updated) };
    } catch (error) {
        console.error("Admin Affiliate Update Error:", error);
        return { success: false, error: "Internal Error" };
    }
}

export async function getPayoutRequests() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

    if (!isSuperAdmin) return { success: false, error: "Forbidden" };

    try {
        const requests = await prisma.payoutRequest.findMany({
            include: {
                affiliate: { select: { name: true, email: true, referralCode: true } },
                squad: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: serialize({ requests }) };
    } catch (error) {
        console.error("Admin Payout List Error:", error);
        return { success: false, error: "Internal Error" };
    }
}

export async function processPayout(requestId: string, action: "approved" | "rejected", notes?: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

    if (!isSuperAdmin) return { success: false, error: "Forbidden" };

    try {
        if (!requestId || !["approved", "rejected"].includes(action)) {
            return { success: false, error: "Invalid request" };
        }

        const payoutReq = await prisma.payoutRequest.findUnique({
            where: { id: requestId },
            include: { affiliate: true, squad: true }
        });

        if (!payoutReq) {
            return { success: false, error: "Payout request not found" };
        }

        if (payoutReq.status !== "pending") {
            return { success: false, error: "This request has already been processed" };
        }

        // Jika request diajukan oleh Squad
        if (payoutReq.squadId && payoutReq.squad) {
            if (action === "approved") {
                await prisma.payoutRequest.update({
                    where: { id: requestId },
                    data: { status: "approved", notes, processedAt: new Date() }
                });
                // Logika notifikasi squad jika diperlukan dapat diletakkan di sini
            } else {
                await prisma.payoutRequest.update({
                    where: { id: requestId },
                    data: { status: "rejected", notes, processedAt: new Date() }
                });
            }
            revalidatePath('/admin/marketing');
            return { success: true, data: { action } };
        }

        // Jika request diajukan oleh Affiliate
        if (payoutReq.affiliateId && payoutReq.affiliate) {
            if (action === "approved") {
                await prisma.$transaction([
                    prisma.payoutRequest.update({
                        where: { id: requestId },
                        data: { status: "approved", notes, processedAt: new Date() }
                    }),
                    prisma.affiliateProfile.update({
                        where: { id: payoutReq.affiliateId },
                        data: { paidEarnings: { increment: payoutReq.amount } }
                    }),
                    prisma.commissionLog.updateMany({
                        where: {
                            affiliateId: payoutReq.affiliateId,
                            status: "pending",
                            createdAt: { lte: payoutReq.createdAt }
                        },
                        data: { status: "paid", paidAt: new Date() }
                    })
                ]);

                sendPayoutApprovedEmail(payoutReq.affiliate.email, payoutReq.affiliate.name, payoutReq.amount)
                    .catch(err => console.error("Email send failed:", err));
            } else {
                await prisma.payoutRequest.update({
                    where: { id: requestId },
                    data: { status: "rejected", notes, processedAt: new Date() }
                });

                sendPayoutRejectedEmail(payoutReq.affiliate.email, payoutReq.affiliate.name, payoutReq.amount, notes)
                    .catch(err => console.error("Email send failed:", err));
            }
        }

        revalidatePath('/admin/marketing');
        return { success: true, data: { action } };
    } catch (error) {
        console.error("Admin Payout Error:", error);
        return { success: false, error: "Internal Error" };
    }
}

// ============================================================
// Admin Team
// ============================================================

export async function manageTeamPermission(userId: string, email: string, key: string, action: "grant" | "revoke") {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await getCurrentUser();

        if (user?.id === userId) {
            return { success: false, error: "Admin cannot manage their own permissions to prevent accidental lockout." };
        }

        if (key === 'developer') {
            if (action === 'grant') {
                const existingProfile = await prisma.squadProfile.findUnique({
                    where: { userId }
                });

                if (existingProfile) {
                    await prisma.squadProfile.update({
                        where: { userId },
                        data: { status: 'vetted' }
                    });
                } else {
                    let targetName = email.split('@')[0];
                    try {
                        const targetUser = await hexclaveServerApp.getUser(userId);
                        if (targetUser?.displayName) {
                            targetName = targetUser.displayName;
                        }
                    } catch {
                        console.warn(`[ADMIN_TEAM] Could not fetch user ${userId}, using email as name.`);
                    }

                    await prisma.squadProfile.create({
                        data: {
                            userId,
                            email,
                            name: targetName,
                            role: 'engineer',
                            yearsOfExp: 0,
                            skills: [],
                            status: 'vetted'
                        }
                    });
                }
            } else if (action === 'revoke') {
                await prisma.squadProfile.update({
                    where: { userId },
                    data: { status: 'rejected' }
                });
            }
        } else {
            if (action === 'grant') {
                await grantPermission(userId, email, key);
            } else if (action === 'revoke') {
                await revokePermission(userId, key);
            } else {
                return { success: false, error: "Invalid action" };
            }
        }

        revalidatePath('/admin/team');
        return { success: true };
    } catch (error) {
        console.error("Admin team action error:", error);
        return { success: false, error: (error as Error).message };
    }
}

// ============================================================
// Admin Squad Users
// ============================================================

export async function getSquadDevelopers() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const profiles = await prisma.squadProfile.findMany({
            orderBy: { name: 'asc' },
            select: {
                userId: true,
                name: true,
                email: true,
                role: true
            }
        });

        const developers = profiles.map(p => ({
            id: p.userId,
            displayName: `${p.name} (${p.role})`,
            primaryEmail: p.email,
        }));

        return { success: true, data: developers };
    } catch (error) {
        console.error("Failed to fetch squad profiles:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

// ============================================================
// Admin Licenses
// ============================================================

export async function getAdminLicenses(productId?: string | null, page = 1, limit = 50) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const skip = (page - 1) * limit;
        const where = productId ? { productId } : {};

        const licenses = await prisma.license.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            include: {
                product: {
                    select: { name: true, slug: true }
                }
            }
        });

        return { success: true, data: serialize(licenses) };
    } catch (error) {
        console.error("[LICENSES_GET]", error);
        return { success: false, error: "Internal Error" };
    }
}

export async function createManualLicense(data: {
    productId: string;
    maxActivations?: number;
    expiresAt?: string | null;
    status?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
}) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const { productId, maxActivations, expiresAt, status, userId, metadata } = data;

        if (!productId) {
            return { success: false, error: "Product ID required" };
        }

        const key = generateKey();

        const license = await prisma.license.create({
            data: {
                key,
                productId,
                maxActivations: maxActivations || 1,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                status: status || 'active',
                userId,
                metadata: metadata as Prisma.InputJsonValue
            },
        });

        revalidatePath('/admin/licenses');
        return { success: true, data: serialize(license) };
    } catch (error) {
        console.error("[LICENSES_POST]", error);
        return { success: false, error: "Internal Error" };
    }
}

// ============================================================
// Affiliate Bank
// ============================================================

export async function updateBankDetails(bankName: string, accountNumber: string, accountHolder: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        if (!bankName || !accountNumber || !accountHolder) {
            return { success: false, error: "Missing required fields" };
        }

        const bankInfo = { bankName, accountNumber, accountHolder };

        await prisma.affiliateProfile.update({
            where: { userId: user.id },
            data: { bankInfo }
        });

        return { success: true, data: bankInfo };
    } catch (error) {
        console.error("Update Bank Details Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

// ============================================================
// Affiliate Stats
// ============================================================

export async function getAffiliateStats() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const profile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id },
            include: {
                commissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: { referrals: true }
                }
            }
        });

        if (!profile) return { success: false, error: "Not Found" };

        return {
            success: true,
            data: serialize({
                ...profile,
                referralCount: profile._count.referrals
            })
        };
    } catch (error) {
        console.error("Affiliate Stats Error:", error);
        return { success: false, error: "Internal Error" };
    }
}
