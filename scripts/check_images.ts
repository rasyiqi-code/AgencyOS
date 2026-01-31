import { prisma } from "../lib/db";

async function main() {
    const services = await prisma.service.findMany({
        select: { title: true, image: true, id: true }
    });
    console.log("SERVICE IMAGES:");
    services.forEach(s => console.log(`[${s.title}]: ${s.image}`));

    const setting = await prisma.systemSetting.findUnique({
        where: { key: "r2_public_domain" }
    });
    console.log("R2 DOMAIN SETTING:", setting?.value);
}

main();
