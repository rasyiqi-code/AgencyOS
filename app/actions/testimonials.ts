"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";

export async function submitTestimonial(formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const content = formData.get("content") as string;

    if (!name || !role || !content) {
        return { success: false, error: "Please fill in all fields" };
    }

    try {
        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                role,
                content,
                avatar: user.profileImageUrl,
                isActive: false,
            },
        });

        return { success: true, data: testimonial };
    } catch {
        return { success: false, error: "Failed to create testimonial" };
    }
}

export async function toggleTestimonialStatus(id: string, isActive: boolean) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.testimonial.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to update testimonial" };
    }
}

export async function deleteTestimonial(id: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.testimonial.delete({ where: { id } });

        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete testimonial" };
    }
}
