import { prisma } from "./lib/db";

async function main() {
    try {
        console.error("STARTING DEBUG...");
        const services = await prisma.service.findMany({
            select: { title: true, image: true }
        });
        console.error("FOUND " + services.length + " SERVICES");
        services.forEach(s => console.error("IMAGE: " + s.image));
        
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "r2_public_domain" }
        });
        console.error("SETTING: " + (setting?.value || "NULL"));
    } catch (e) {
        console.error("ERROR: " + e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
