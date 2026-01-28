
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { serviceId } = body;

        if (!serviceId) {
            return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
        }

        // Fetch service details for titles
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

        // Create Project Placeholder (Hidden until paid)
        const project = await prisma.project.create({
            data: {
                userId: user.id,
                clientName: user.displayName || user.primaryEmail || "Unnamed Client",
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

        return NextResponse.json({ url: `/checkout/${estimate.id}` });
    } catch (error) {
        console.error("Create Service Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
