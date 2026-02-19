import { prisma } from "../lib/config/db";
import { slugify } from "../lib/shared/utils";

async function main() {
    const services = await prisma.service.findMany({
        where: { slug: null }
    });

    console.log(`Found ${services.length} services without slugs.`);

    for (const service of services) {
        const slug = slugify(service.title);
        // Check if slug already exists (basic conflict resolution)
        const count = await prisma.service.count({
            where: { slug }
        });

        const finalSlug = count > 0 ? `${slug}-${service.id.slice(-4)}` : slug;

        await prisma.service.update({
            where: { id: service.id },
            data: { slug: finalSlug }
        });
        console.log(`Updated "${service.title}" with slug: ${finalSlug}`);
    }

    console.log("Migration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
