
import { PrismaClient } from "@prisma/client";
import 'dotenv/config';

// Bun supports top-level await and environment variables from .env automatically
const prisma = new PrismaClient();

async function main() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
                createdAt: true
            }
        });
        console.log("RECENT ORDERS:");
        orders.forEach(o => {
            console.log(`[${o.createdAt.toISOString()}] ${o.id}: ${o.amount} ${o.currency} (${o.status})`);
        });
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
