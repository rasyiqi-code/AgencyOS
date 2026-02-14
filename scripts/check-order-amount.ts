
import { PrismaClient } from "@prisma/client";
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    const orderId = 'ORDER-1771081135998-465';
    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });
    console.log("Order Debug:", JSON.stringify(order, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
