import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";

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
    revalidatePath("/admin/marketing");
    return lead;
}

export async function getLeads() {
    return await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function deleteLead(id: string) {
    await prisma.lead.delete({
        where: { id },
    });
    revalidatePath("/admin/marketing");
}
