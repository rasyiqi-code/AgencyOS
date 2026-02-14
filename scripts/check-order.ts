
import { prisma } from "../lib/config/db";

async function main() {
    const orderId = "ORDER-1771061658035-997";
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { project: true }
    });
    console.log(JSON.stringify(order, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
