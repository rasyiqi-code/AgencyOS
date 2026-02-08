
import { prisma } from '../lib/config/db';

async function main() {
    console.log("--- All System Settings ---");
    const settings = await prisma.systemSetting.findMany();
    console.log(JSON.stringify(settings, null, 2));

    console.log("\n--- All Page SEO Entries ---");
    const allPageSeo = await prisma.pageSeo.findMany();
    console.log(JSON.stringify(allPageSeo, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
