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
/**
 * Helper: Proses komisi affiliate secara massal untuk menghindari query N+1.
 *
 * @param orders - Array dari order yang sudah dibayar
 */
export async function processAffiliateCommissionsBulk(
    orders: { id: string; amount: number; paymentMetadata: unknown }[]
): Promise<void> {
    try {
        const orderMap = new Map<string, { orderId: string, amount: number, affiliateCode: string }>();

        // 1. Extract valid affiliate orders
        for (const order of orders) {
            const metadata = order.paymentMetadata as Record<string, unknown> | null;
            if (metadata?.affiliate_code) {
                orderMap.set(order.id, {
                    orderId: order.id,
                    amount: order.amount,
                    affiliateCode: metadata.affiliate_code as string
                });
            }
        }

        if (orderMap.size === 0) return;

        const uniqueCodes = Array.from(new Set(Array.from(orderMap.values()).map(o => o.affiliateCode)));
        const orderIds = Array.from(orderMap.keys());

        // 2. Fetch affiliates
        const affiliates = await prisma.affiliateProfile.findMany({
            where: {
                referralCode: { in: uniqueCodes },
                status: 'active'
            }
        });

        const affiliateMap = new Map(affiliates.map(a => [a.referralCode, a]));

        // 3. Fetch existing commissions to prevent duplicates
        const existingCommissions = await prisma.commissionLog.findMany({
            where: { orderId: { in: orderIds } },
            select: { orderId: true }
        });
        const existingOrderIds = new Set(existingCommissions.map(c => c.orderId));

        // 4. Prepare data
        const commissionLogsToCreate = [];
        const earningsToIncrement = new Map<string, number>(); // affiliateId -> total increment
        const emailsToSend: { email: string; name: string; amount: number; orderId: string }[] = [];

        for (const order of orderMap.values()) {
            if (existingOrderIds.has(order.orderId)) {
                console.log(`[COMMISSION] Already exists for Order ${order.orderId}, skipping`);
                continue; // skip duplicates
            }

            const affiliate = affiliateMap.get(order.affiliateCode);
            if (!affiliate) {
                console.log(`[COMMISSION] Affiliate ${order.affiliateCode} not found or not active`);
                continue;
            }

            const commissionAmount = order.amount * (affiliate.commissionRate / 100);

            commissionLogsToCreate.push({
                affiliateId: affiliate.id,
                amount: commissionAmount,
                orderId: order.orderId,
                description: `Commission for Order ${order.orderId}`,
                status: "pending"
            });

            earningsToIncrement.set(affiliate.id, (earningsToIncrement.get(affiliate.id) || 0) + commissionAmount);

            emailsToSend.push({
                email: affiliate.email,
                name: affiliate.name,
                amount: commissionAmount,
                orderId: order.orderId
            });
        }

        if (commissionLogsToCreate.length === 0) return;

        // 5. Execute transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transactions: any[] = [
            prisma.commissionLog.createMany({
                data: commissionLogsToCreate
            })
        ];

        for (const [affiliateId, amount] of earningsToIncrement.entries()) {
            transactions.push(
                prisma.affiliateProfile.update({
                    where: { id: affiliateId },
                    data: { totalEarnings: { increment: amount } }
                })
            );
        }

        await prisma.$transaction(transactions);

        for (const log of commissionLogsToCreate) {
            console.log(`[COMMISSION] Awarded $${log.amount.toFixed(2)} to ${affiliates.find(a => a.id === log.affiliateId)?.referralCode} for Order ${log.orderId}`);
        }

        // 6. Send emails non-blocking
        for (const email of emailsToSend) {
            sendCommissionEmail(email.email, email.name, email.amount, email.orderId)
                .catch(err => console.error("[COMMISSION_EMAIL_ERROR]", err));
        }

    } catch (error) {
        console.error("[COMMISSION_BULK_ERROR]", error);
    }
}

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
