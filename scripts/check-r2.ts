
import { prisma } from '../lib/config/db';

async function main() {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { startsWith: 'r2' }
            }
        });
        console.log("All R2-related settings:");
        console.log(JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error("Database Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
