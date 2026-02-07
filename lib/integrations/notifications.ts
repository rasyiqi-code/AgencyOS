import { prisma } from "../config/db";
// Trigger re-lint

export async function createNotification({
    userId,
    title,
    content,
    type = "info",
    link
}: {
    userId: string;
    title: string;
    content: string;
    type?: "info" | "success" | "warning" | "error";
    link?: string;
}) {
    return await prisma.notification.create({
        data: {
            userId,
            title,
            content,
            type,
            link
        }
    });
}
