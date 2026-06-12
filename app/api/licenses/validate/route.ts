import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * API Endpoint untuk Validasi & Aktivasi Lisensi Produk Jadi (POST /api/licenses/validate)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { licenseKey, productName, productSlug, domain } = body;

        // 1. Validasi input parameter
        if (!licenseKey || !domain || (!productName && !productSlug)) {
            return NextResponse.json(
                { success: false, message: "Kunci lisensi (licenseKey), identifikasi produk (productName/productSlug), dan domain wajib diisi." },
                { status: 400 }
            );
        }

        // Bersihkan nama domain
        const cleanDomain = domain
            .replace(/^(https?:\/\/)?(www\.)?/, "")
            .split("/")[0]
            .toLowerCase();

        console.log(`[LICENSE_VALIDATION] Memvalidasi: ${licenseKey} untuk Produk: ${productName || productSlug} di Domain: ${cleanDomain}`);

        // 2. Cari lisensi di database
        const license = await prisma.license.findUnique({
            where: { key: licenseKey },
            include: {
                activations: true,
                product: true
            }
        });

        if (!license) {
            return NextResponse.json(
                { success: false, message: "Kunci lisensi tidak valid atau tidak terdaftar." },
                { status: 404 }
            );
        }

        // 3. Verifikasi apakah lisensi sesuai dengan produk yang diakses
        const matchByName = productName && license.product.name.toLowerCase() === productName.toLowerCase();
        const matchBySlug = productSlug && license.product.slug.toLowerCase() === productSlug.toLowerCase();

        if (!matchByName && !matchBySlug) {
            return NextResponse.json(
                { success: false, message: "Kunci lisensi ini tidak valid untuk produk ini." },
                { status: 403 }
            );
        }

        // 4. Verifikasi status penangguhan (suspended)
        if (license.status === "suspended") {
            return NextResponse.json(
                { success: false, message: "Lisensi ini telah ditangguhkan oleh administrator." },
                { status: 403 }
            );
        }

        // 5. Verifikasi tanggal kedaluwarsa
        const now = new Date();
        if (license.expiresAt && license.expiresAt < now) {
            if (license.status === "active") {
                await prisma.license.update({
                    where: { id: license.id },
                    data: { status: "expired" }
                });
            }

            return NextResponse.json(
                { 
                    success: false, 
                    message: "Lisensi ini telah kedaluwarsa.",
                    expiresAt: license.expiresAt 
                },
                { status: 403 }
            );
        }

        // 6. Periksa apakah domain ini sudah diaktivasi sebelumnya
        const existingActivation = license.activations.find(
            (act: any) => act.domain.toLowerCase() === cleanDomain
        );

        if (existingActivation) {
            return NextResponse.json({
                success: true,
                message: "Lisensi valid dan aktif untuk domain ini.",
                data: {
                    licenseKey: license.key,
                    status: license.status,
                    expiresAt: license.expiresAt,
                    productName: license.product.name,
                    maxActivations: license.maxActivations,
                    currentActivations: license.activations.length,
                    activatedAt: existingActivation.activatedAt
                }
            });
        }

        // 7. Jika domain baru, periksa batas kuota aktivasi
        if (license.activations.length >= license.maxActivations) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: `Batas aktivasi domain telah tercapai (maksimum ${license.maxActivations} domain).` 
                },
                { status: 403 }
            );
        }

        // 8. Catat aktivasi domain baru
        const newActivation = await prisma.licenseActivation.create({
            data: {
                licenseId: license.id,
                domain: cleanDomain,
                metadata: {
                    userAgent: req.headers.get("user-agent"),
                    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Lisensi berhasil diaktifkan pada domain baru.",
            data: {
                licenseKey: license.key,
                status: license.status,
                expiresAt: license.expiresAt,
                productName: license.product.name,
                maxActivations: license.maxActivations,
                currentActivations: license.activations.length + 1,
                activatedAt: newActivation.activatedAt
            }
        });

    } catch (error) {
        console.error("[LICENSE_VALIDATION_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan internal pada server." },
            { status: 500 }
        );
    }
}
