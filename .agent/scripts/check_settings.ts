import { prisma } from "./lib/db";

async function main() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: "r2_public_domain" }
    });
    console.log(JSON.stringify(settings, null, 2));
}

main();
