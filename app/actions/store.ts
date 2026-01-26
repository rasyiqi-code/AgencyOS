"use server";

import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";

export async function createServiceOrder(serviceId: string) {
    const user = await stackServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch service details for titles
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service not found");

    // Create Project Placeholder (Hidden until paid)
    const project = await prisma.project.create({
        data: {
            userId: user.id,
            title: `Order: ${service.title}`,
            description: `Purchase of ${service.title} (${service.interval})`,
            status: 'payment_pending',
            serviceId: service.id,
        }
    });

    // Create Invoice (Estimate)
    const estimate = await prisma.estimate.create({
        data: {
            title: `Invoice for ${service.title}`,
            prompt: "Productized Service Purchase",
            summary: `Automated invoice for ${service.title}`,
            screens: [],
            apis: [],
            totalHours: 0,
            totalCost: service.price,
            complexity: service.interval === 'one_time' ? 'Fixed' : 'Subscription',
            status: 'pending_payment',
            serviceId: service.id,
            project: {
                connect: { id: project.id }
            }
        }
    });

    // Link back 
    await prisma.project.update({
        where: { id: project.id },
        data: { estimateId: estimate.id }
    });

    redirect(`/checkout/${estimate.id}`);
}
