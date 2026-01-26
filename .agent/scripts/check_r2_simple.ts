import { prisma } from "./lib/db";

async function main() {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: "r2_public_domain" }
    });
    console.log("R2_DOMAIN_VALUE:", setting?.value);
}

main();
