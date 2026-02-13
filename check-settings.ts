import { prisma } from "@/lib/config/db";

async function main() {
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: {
                in: ['AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'bank_name']
            }
        }
    });
    console.log("Current Settings:", settings);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
