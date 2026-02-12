import { prisma } from "@/lib/config/db";
import { sendCommissionEmail } from "@/lib/email/affiliate-emails";

/**
 * Helper: Proses komisi affiliate setelah pembayaran berhasil.
 * Bisa dipanggil dari Midtrans webhook, Creem webhook, atau payment status polling.
 *
 * @param orderId - ID order yang sudah dibayar
 * @param orderAmount - Nominal pembayaran
 * @param paymentMetadata - Metadata order (berisi affiliate_code jika ada referral)
 */
export async function processAffiliateCommission(
    orderId: string,
    orderAmount: number,
    paymentMetadata: unknown
): Promise<void> {
    try {
        const metadata = paymentMetadata as Record<string, unknown> | null;

        // Cek apakah ada affiliate code di metadata
        if (!metadata?.affiliate_code) {
            return; // Bukan referral order, skip
        }

        const affiliateCode = metadata.affiliate_code as string;

        const affiliate = await prisma.affiliateProfile.findUnique({
            where: { referralCode: affiliateCode }
        });

        if (!affiliate || affiliate.status !== 'active') {
            console.log(`[COMMISSION] Affiliate ${affiliateCode} not found or not active`);
            return;
        }

        const commissionAmount = orderAmount * (affiliate.commissionRate / 100);

        // Cek duplikasi: jangan buat commission ganda untuk order yang sama
        const existingCommission = await prisma.commissionLog.findFirst({
            where: { orderId }
        });

        if (existingCommission) {
            console.log(`[COMMISSION] Already exists for Order ${orderId}, skipping`);
            return;
        }

        // Buat commission log dan update total earnings dalam satu transaksi
        await prisma.$transaction([
            prisma.commissionLog.create({
                data: {
                    affiliateId: affiliate.id,
                    amount: commissionAmount,
                    orderId,
                    description: `Commission for Order ${orderId}`,
                    status: "pending"
                }
            }),
            prisma.affiliateProfile.update({
                where: { id: affiliate.id },
                data: {
                    totalEarnings: { increment: commissionAmount }
                }
            })
        ]);

        console.log(`[COMMISSION] Awarded $${commissionAmount.toFixed(2)} to ${affiliate.referralCode} for Order ${orderId}`);

        // Kirim email notifikasi ke affiliate (non-blocking)
        sendCommissionEmail(affiliate.email, affiliate.name, commissionAmount, orderId)
            .catch(err => console.error("[COMMISSION_EMAIL_ERROR]", err));

    } catch (error) {
        // Jangan gagalkan proses utama, cukup log error
        console.error("[COMMISSION_ERROR]", error);
    }
}
