import 'dotenv/config';
import { prisma } from '../lib/config/db';

async function checkSeo() {
    try {
        const pages = await prisma.pageSeo.findMany();
        console.log("PageSeo Entries:", JSON.stringify(pages, null, 2));
    } catch (error) {
        console.error("Error fetching PageSeo:", error);
    } finally {
        // Do not disconnect the shared prisma instance in a script that might be using connection pooling
        // but here it is fine since it is a standalone script
        await prisma.$disconnect();
    }
}

checkSeo();
