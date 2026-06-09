import { prisma } from '@/lib/config/db';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ApiItem, ScreenItem, ScreenItemSchema, ApiItemSchema } from '@/lib/shared/types';
import { z } from 'zod';
import { isAdmin } from '@/lib/shared/auth-helpers';

const UpdateBodySchema = z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    additions: z.object({
        screens: z.array(ScreenItemSchema).optional(),
        apis: z.array(ApiItemSchema).optional(),
    }).optional(),
    removals: z.object({
        screens: z.array(z.string()).optional(), // Array of titles to remove
        apis: z.array(z.string()).optional(),
    }).optional(),
    // Legacy support
    screens: z.array(ScreenItemSchema).optional(),
    apis: z.array(ApiItemSchema).optional(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check: hanya admin yang boleh mengubah estimate
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const json = await request.json();
        const validation = UpdateBodySchema.safeParse(json);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
        }

        const body = validation.data;
        const { additions, removals, summary, title } = body;

        // Fetch current estimate
        const currentEstimate = await prisma.estimate.findUnique({
            where: { id }
        });

        if (!currentEstimate) {
            return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
        }

        // 1. Handle Removals
        // Cast DB Json to our typed array. Safe because we validate on write.
        let existingScreens = (currentEstimate.screens as unknown as ScreenItem[]) || [];
        let existingApis = (currentEstimate.apis as unknown as ApiItem[]) || [];

        if (removals) {
            if (removals.screens?.length) {
                existingScreens = existingScreens.filter(s => !removals.screens?.includes(s.title));
            }
            if (removals.apis?.length) {
                existingApis = existingApis.filter(a => !removals.apis?.includes(a.title));
            }
        }

        // 2. Handle Additions
        // Support legacy body.screens if additions is not present
        const newScreens = additions?.screens || body.screens || [];
        const newApis = additions?.apis || body.apis || [];

        const mergedScreens = [...existingScreens, ...newScreens];
        const mergedApis = [...existingApis, ...newApis];

        // Rate constant
        const HOURLY_RATE = 12;

        // Calculate totals
        const screensHours = mergedScreens.reduce((acc, item) => acc + (item.hours || 0), 0);
        const apisHours = mergedApis.reduce((acc, item) => acc + (item.hours || 0), 0);
        const totalHours = screensHours + apisHours;
        const totalCost = totalHours * HOURLY_RATE;

        // Update database
        const updatedEstimate = await prisma.estimate.update({
            where: { id },
            data: {
                title: title || undefined,
                summary: summary || undefined,
                screens: mergedScreens as unknown as Prisma.InputJsonValue,
                apis: mergedApis as unknown as Prisma.InputJsonValue,
                totalHours,
                totalCost,
            },
        });

        return NextResponse.json(updatedEstimate);
    } catch (error) {
        console.error('Error updating estimate:', error);
        return NextResponse.json(
            { error: 'Failed to update estimate' },
            { status: 500 }
        );
    }
}
