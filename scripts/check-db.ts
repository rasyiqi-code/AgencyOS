
import { prisma } from './lib/db';

async function main() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'LOGO_URL' },
        });
        console.log('LOGO_URL in DB:', setting);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
