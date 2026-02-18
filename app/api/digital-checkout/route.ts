import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { validateCoupon } from "@/lib/server/marketing";
import { stackServerApp } from "@/lib/config/stack";

/**
 * API Route: POST /api/digital-checkout
 *
 * Membuat DigitalOrder dan Snap token Midtrans untuk pembayaran produk digital.
 * Flow:
 * 1. Validasi input (productId, email wajib)
 * 2. Cek produk ada dan aktif
 * 3. Buat DigitalOrder (status PENDING)
 * 4. Convert harga USD → IDR
 * 5. Buat Snap token via Midtrans
 * 6. Simpan snapToken ke DigitalOrder
 * 7. Return { token, orderId } ke client
 */


export async function POST(req: Request) {
    try {
        // Enforce Auth
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId, email, name, affiliateCode, couponCode } = await req.json();
        const userId = user.id; // Override userId from session
        const userEmail = user.primaryEmail || email; // Prioritize Stack Auth email
        const userName = user.displayName || name;


        // Validasi input wajib
        if (!productId || !userEmail) {
            return NextResponse.json(
                { error: "productId dan email wajib diisi" },
                { status: 400 }
            );
        }

        // Cek produk ada dan aktif
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product || !product.isActive) {
            return NextResponse.json(
                { error: "Produk tidak ditemukan atau tidak aktif" },
                { status: 404 }
            );
        }

        if (product.price <= 0) {
            return NextResponse.json(
                { error: "Harga produk tidak valid" },
                { status: 400 }
            );
        }

        // Cek apakah payment gateway aktif
        const hasGateway = await paymentGatewayService.hasActiveGateway();
        if (!hasGateway) {
            return NextResponse.json(
                { error: "Payment gateway belum dikonfigurasi. Hubungi admin." },
                { status: 503 }
            );
        }

        // Buat ID order unik dengan prefix DIGI- agar bisa dibedakan di webhook
        const orderId = `DIGI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Handle Coupon
        let finalAmount = product.price;
        if (couponCode) {
            const couponResult = await validateCoupon(couponCode, "DIGITAL");
            if (couponResult.valid && couponResult.coupon) {
                const coupon = couponResult.coupon;
                if (coupon.discountType === 'percentage') {
                    finalAmount = product.price * (1 - coupon.discountValue / 100);
                } else {
                    finalAmount = Math.max(0, product.price - coupon.discountValue);
                }
            }
        }

        // Buat DigitalOrder di database
        await prisma.digitalOrder.create({
            data: {
                id: orderId,
                productId: product.id,
                userId: userId || null,
                userEmail: userEmail,
                userName: userName || null,
                amount: finalAmount,
                status: "PENDING",

                paymentMetadata: {
                    ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
                    ...(couponCode ? { coupon_code: couponCode } : {}),
                },
            },
        });

        console.log(`[DIGITAL_CHECKOUT] Order ${orderId} created (Ready for Core API payment)`);

        return NextResponse.json({
            orderId: orderId,
            redirectUrl: `/digital-invoices/${orderId}`
        });

    } catch (error) {
        console.error("[DIGITAL_CHECKOUT_ERROR]", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat memproses checkout" },
            { status: 500 }
        );
    }
}
