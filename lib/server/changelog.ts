import { prisma } from "@/lib/config/db";

export async function getChangelogs(publishedOnly = true) {
    return await prisma.changelog.findMany({
        where: publishedOnly ? { status: 'published' } : {},
        orderBy: { publishedAt: 'desc' }
    });
}
