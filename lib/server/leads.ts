// revalidatePath/revalidateTag tidak diperlukan di TanStack Start
import { prisma } from "@/lib/config/db";

export async function createLead(data: {
    firstName: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    subject?: string;
    message?: string;
    source?: string;
    path?: string;
    locale?: string;
}) {
    const lead = await prisma.lead.create({
        data,
    });
return lead;
}

export async function getLeads(limit?: number) {
    // Membatasi pengambilan data leads untuk mencegah kebocoran memori (OOM)
    return await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: limit || 100,
    });
}

export async function deleteLead(id: string) {
    await prisma.lead.delete({
        where: { id },
    });
}
