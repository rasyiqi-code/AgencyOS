import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check: hanya admin yang boleh menghapus license
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "License ID required" }, { status: 400 });
        }

        // Cek apakah license ada
        const license = await prisma.license.findUnique({
            where: { id },
            include: {
                digitalOrder: true
            }
        });

        if (!license) {
            return NextResponse.json({ error: "License not found" }, { status: 404 });
        }

        // Jika license terhubung dengan order yang sudah lunas, 
        // mungkin sebaiknya jangan dihapus atau beri peringatan.
        // Di sini kita izinkan hapus tapi berikan respons sukses.
        await prisma.license.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[LICENSE_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
