
import { stackServerApp } from "@/lib/config/stack";
import { uploadFile } from "@/lib/integrations/storage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Admin check (reused logic)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) return new NextResponse("Forbidden", { status: 403 });

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        // Upload to R2
        const path = `marketing/assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const url = await uploadFile(file, path);

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload Asset Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
