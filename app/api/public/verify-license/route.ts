import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { key, productSlug, machineId, domain } = body;

        if (!key) {
            return NextResponse.json({ valid: false, message: "License key required" }, { status: 400 });
        }

        const license = await prisma.license.findUnique({
            where: { key },
            include: { product: true }
        });

        if (!license) {
            return NextResponse.json({ valid: false, message: "Invalid license key" }, { status: 404 });
        }

        if (license.product.slug !== productSlug) {
            return NextResponse.json({ valid: false, message: "Invalid product for this license" }, { status: 403 });
        }

        if (license.status !== 'active') {
            return NextResponse.json({ valid: false, message: "License is not active" }, { status: 403 });
        }

        if (license.expiresAt && new Date() > license.expiresAt) {
            return NextResponse.json({ valid: false, message: "License expired" }, { status: 403 });
        }

        // Check activations
        // We use a simple JSON structure to track devices: { devices: ["machineId1", "domain1"] }

        let currentActivations: any = license.metadata || {};
        // Ensure it's an object
        if (typeof currentActivations !== 'object') {
            currentActivations = {};
        }

        const devices: string[] = Array.isArray(currentActivations.devices) ? currentActivations.devices : [];
        const deviceId = machineId || domain || 'unknown';

        const isAlreadyActivated = devices.includes(deviceId);

        if (!isAlreadyActivated) {
            // If strict machine ID check is needed, do it here.
            // For now, if not already activated, check limit
            if (license.activations >= license.maxActivations) {
                return NextResponse.json({ valid: false, message: "Max activations reached" }, { status: 403 });
            }

            // Register new activation
            // const updatedDevices = [...devices, deviceId];
            devices.push(deviceId);

            await prisma.license.update({
                where: { id: license.id },
                data: {
                    activations: { increment: 1 },
                    metadata: { ...currentActivations, devices }
                }
            });
        }

        return NextResponse.json({
            valid: true,
            product: {
                name: license.product.name,
                slug: license.product.slug
            },
            license: {
                id: license.id,
                expiresAt: license.expiresAt
            }
        });

    } catch (error) {
        console.error("[VERIFY_LICENSE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
