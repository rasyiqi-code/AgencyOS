
import { prisma } from '../lib/db';

async function main() {
    try {
        const url = "https://cdn.worldvectorlogo.com/logos/next-js.svg"; // Test logo
        await prisma.systemSetting.upsert({
            where: { key: 'LOGO_URL' },
            create: { key: 'LOGO_URL', value: url, description: 'Test Logo' },
            update: { value: url }
        });
        console.log('Seeded LOGO_URL');
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
