import { prisma } from "./lib/db";

async function main() {
    const settings = await prisma.systemSetting.findMany();
    console.log("ALL SETTINGS:", JSON.stringify(settings, null, 2));
}

main();
