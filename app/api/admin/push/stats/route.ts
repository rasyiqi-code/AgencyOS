import { NextResponse } from 'next/server';
import { prisma } from '@/lib/config/db';

export async function GET() {
    try {
        const totalSubscribers = await prisma.pushSubscription.count();

        // In a real scenario, you might want to track clicks/impressions 
        // to calculate engagement. For now, we return 0 or a placeholder.
        const engagementRate = 0;

        return NextResponse.json({
            subscribers: totalSubscribers,
            engagement: engagementRate
        });
    } catch (error) {
        console.error('Failed to fetch push stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
