import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Fallback if regular isn't working for scripts, but wait, let's just make it simple

async function main() {
    const estimates = await prisma.estimate.findMany({
        where: { id: { endsWith: "110vqbst" } },
        include: { service: true }
    });
    console.log(JSON.stringify(estimates, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
