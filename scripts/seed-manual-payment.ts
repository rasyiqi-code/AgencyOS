
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding manual payment settings...");

    const settings = [
        { key: "CONTACT_PHONE", value: "+6281234567890" },
        { key: "CONTACT_TELEGRAM", value: "@username_tele" },
        { key: "bank_name", value: "Bank Central Asia (BCA)" },
        { key: "bank_account", value: "1234567890" },
        { key: "bank_holder", value: "PT Agency OS Indonesia" },
        { key: "COMPANY_NAME", value: "Agency OS Ltd." },
        { key: "AGENCY_NAME", value: "Agency OS" },
        { key: "CONTACT_EMAIL", value: "billing@agencyos.com" },
        { key: "CONTACT_ADDRESS", value: "Sudirman Central Business District, Jakarta" }
    ];

    for (const setting of settings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: { key: setting.key, value: setting.value },
        });
        console.log(`✅ Set ${setting.key} = ${setting.value}`);
    }

    console.log("\n🚀 Done! Please refresh your invoice page and check the Manual Payment modal.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
