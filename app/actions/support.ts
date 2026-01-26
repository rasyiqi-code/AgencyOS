"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
    const ticketId = formData.get("ticketId") as string;
    const content = formData.get("content") as string;
    const sender = formData.get("sender") as string;
    const file = formData.get("file") as File;

    if (!ticketId || (!content && !file)) throw new Error("Missing required fields");

    const attachments = [];
    if (file && file.size > 0 && file.name !== 'undefined') {
        const { uploadFile } = await import("@/lib/storage");
        const url = await uploadFile(file, `tickets/${ticketId}/${Date.now()}-${file.name}`);
        attachments.push({
            name: file.name,
            url: url,
            type: file.type
        });
    }

    await prisma.supportMessage.create({
        data: {
            ticketId,
            content: content || "",
            sender,
            attachments: attachments.length > 0 ? attachments : undefined
        }
    });

    await prisma.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() }
    });

    revalidatePath(`/dashboard/inbox`);
    return { success: true };
}
