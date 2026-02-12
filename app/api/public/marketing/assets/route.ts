
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch only active banner_widget assets
        // We select only necessary fields to minimize data exposure
        const assets = await prisma.marketingAsset.findMany({
            where: {
                isActive: true,
                type: 'banner_widget'
            },
            select: {
                id: true,
                title: true,
                content: true, // Target URL
                imageUrl: true,
                category: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(assets, {
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all domains to access this for widgets
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    } catch (error) {
        console.error("Public Marketing Assets Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}
