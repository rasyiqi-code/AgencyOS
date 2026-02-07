
import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const active = searchParams.get("active");

        // If active param is not present, return all (for admin), unless specifically requested
        // Logic: 
        // ?active=true -> public active only
        // ?active=false -> show all (admin view usually wants everything, or maybe strictly inactive?)
        // Let's stick to: ?active=true means ONLY active. ?active=false or missing means ALL for admin context usually.
        // Actually, "active=false" implies inactive only? 
        // Let's refine: 
        // Public fetch: ?active=true
        // Admin fetch: ?all=true  or no params = all.

        const onlyActive = active === "true";

        const testimonials = await prisma.testimonial.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: testimonials });
    } catch {
        return NextResponse.json({ success: false, error: "Failed to fetch testimonials" }, { status: 500 });
    }
}



export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, role, content } = body;

        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                role,
                content,
                avatar: user.profileImageUrl, // Enforce authenticated avatar
                isActive: false, // Requires approval
            },
        });

        return NextResponse.json({ success: true, data: testimonial });
    } catch {
        return NextResponse.json({ success: false, error: "Failed to create testimonial" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, isActive } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
        }

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json({ success: true, data: testimonial });
    } catch {
        return NextResponse.json({ success: false, error: "Failed to update testimonial" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
        }

        await prisma.testimonial.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: "Failed to delete testimonial" }, { status: 500 });
    }
}
