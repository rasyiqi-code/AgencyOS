import { prisma } from "@/lib/config/db";

export async function getChangelogs(publishedOnly = true, limit?: number) {
    // Membatasi jumlah data changelog yang diambil untuk optimasi performa dan mencegah OOM
    return await prisma.changelog.findMany({
        where: publishedOnly ? { status: 'published' } : {},
        orderBy: { publishedAt: 'desc' },
        take: limit || 100,
    });
}
