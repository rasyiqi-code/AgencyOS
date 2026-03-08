import { NextResponse } from 'next/server';
import { prisma } from '@/lib/config/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subscription, metadata } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Invalid subscription data' },
                { status: 400 }
            );
        }

        // Extract p256dh and auth keys
        const p256dh = subscription.keys?.p256dh;
        const auth = subscription.keys?.auth;

        if (!p256dh || !auth) {
            return NextResponse.json(
                { error: 'Missing encryption keys' },
                { status: 400 }
            );
        }

        // Save or update subscription in DB
        const savedSubscription = await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                p256dh,
                auth,
                metadata: metadata || {},
                updatedAt: new Date(),
            },
            create: {
                endpoint: subscription.endpoint,
                p256dh,
                auth,
                metadata: metadata || {},
            },
        });

        return NextResponse.json({ success: true, id: savedSubscription.id });
    } catch (error) {
        console.error('Push Subscribe Error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe to push notifications' },
            { status: 500 }
        );
    }
}

// Optional: DELETE to unsubscribe
export async function DELETE(req: Request) {
    try {
        const { endpoint } = await req.json();

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
        }

        await prisma.pushSubscription.deleteMany({
            where: { endpoint },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push Unsubscribe Error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}
