
import { prisma } from "@/lib/config/db";

async function main() {
    const lastOrder = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    console.log("LAST ORDER:", JSON.stringify(lastOrder, null, 2));

    if (lastOrder) {
        console.log("PAYMENT METADATA:", JSON.stringify(lastOrder.paymentMetadata, null, 2));

        const commission = await prisma.commissionLog.findFirst({
            where: { orderId: lastOrder.id }
        });
        console.log("COMMISSION FOR ORDER:", commission);
    }

    const lastCommissions = await prisma.commissionLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log("LAST COMMISSIONS:", JSON.stringify(lastCommissions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
