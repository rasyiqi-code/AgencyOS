import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const keys = await prisma.systemKey.findMany({
        where: { provider: 'google' }
    });
    console.log('--- AI KEYS ---');
    console.log(JSON.stringify(keys, null, 2));
    await prisma.$disconnect();
}

main().catch(console.error);
