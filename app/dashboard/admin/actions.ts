"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProjectStatus(projectId: string, status: string) {
    // Simple validation for MVP
    const validStatuses = ["queue", "dev", "review", "done"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    await prisma.project.update({
        where: { id: projectId },
        data: { status },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/${projectId}`);
}
