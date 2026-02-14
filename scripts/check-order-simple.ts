
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const orderId = "ORDER-1771061658035-997";
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, amount: true, type: true, status: true, project: { select: { totalAmount: true, paidAmount: true } } }
        });
        console.log("ORDER DATA:", JSON.stringify(order, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
