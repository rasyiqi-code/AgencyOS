
import { prisma } from "../lib/config/db";

async function main() {
    console.log("Checking Storage Settings in DB...");
    const keys = ['r2_endpoint', 'r2_access_key_id', 'r2_secret_access_key', 'r2_public_domain', 'r2_bucket_name'];

    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: keys } }
    });

    console.log("Found settings:");
    settings.forEach(s => {
        // Mask secret key
        const val = s.key === 'r2_secret_access_key' ? '******' : s.value;
        console.log(`- ${s.key}: ${val}`);
    });

    const missing = keys.filter(k => !settings.find(s => s.key === k));
    if (missing.length > 0) {
        console.log("MISSING KEYS:", missing);
    } else {
        console.log("All keys present.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
