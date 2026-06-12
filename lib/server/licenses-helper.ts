import { prisma } from "@/lib/config/db";
import { generateKey } from "@/lib/utils/crypto";

/**
 * Membuat lisensi baru atau memperpanjang masa aktif lisensi software mandiri setelah pembayaran sukses.
 * @param orderId ID Order pembayaran dari gateway
 */
export async function handleSoftwareLicenseProvisioning(orderId: string) {
    try {
        console.log(`[SOFTWARE_LICENSE_PROVISION] Memproses lisensi untuk Order ID: ${orderId}`);

        // 1. Ambil data Order
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            console.error(`[SOFTWARE_LICENSE_PROVISION] Order tidak ditemukan: ${orderId}`);
            return;
        }

        // Hanya proses order yang bertipe lisensi software
        if (order.type !== "SOFTWARE_LICENSE") {
            console.log(`[SOFTWARE_LICENSE_PROVISION] Order ${orderId} bertipe ${order.type} (Bukan SOFTWARE_LICENSE). Skip.`);
            return;
        }

        // 2. Ambil Product ID dari paymentMetadata
        const metadata = order.paymentMetadata as Record<string, any> | null;
        const productId = metadata?.productId;

        if (!productId) {
            console.error(`[SOFTWARE_LICENSE_PROVISION] Product ID tidak ditemukan di metadata Order: ${orderId}`);
            return;
        }

        // 3. Ambil data produk software
        const product = await prisma.softwareProduct.findUnique({
            where: { id: productId }
        });

        if (!product) {
            console.error(`[SOFTWARE_LICENSE_PROVISION] Produk software dengan ID ${productId} tidak ditemukan.`);
            return;
        }

        // 4. Hitung tanggal kedaluwarsa berdasarkan interval billing produk
        const now = new Date();
        let expiresAt: Date | null = null;

        if (product.interval === "monthly") {
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 Hari
        } else if (product.interval === "yearly") {
            expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 Hari
        }

        // 5. Periksa apakah user ini sudah pernah memiliki lisensi untuk produk ini
        const existingLicense = await prisma.license.findFirst({
            where: {
                userId: order.userId,
                productId: product.id
            }
        });

        if (existingLicense) {
            // ALUR PERPANJANGAN (RENEWAL)
            console.log(`[SOFTWARE_LICENSE_PROVISION] Lisensi sudah ada (${existingLicense.key}). Memperbarui masa aktif.`);

            let newExpiresAt = expiresAt;
            if (existingLicense.expiresAt && existingLicense.expiresAt > now && expiresAt) {
                // Jika masih aktif, tambahkan masa aktif baru di atas masa aktif lama
                const diffTime = expiresAt.getTime() - now.getTime();
                newExpiresAt = new Date(existingLicense.expiresAt.getTime() + diffTime);
            }

            await prisma.license.update({
                where: { id: existingLicense.id },
                data: {
                    status: "active",
                    expiresAt: newExpiresAt,
                    metadata: {
                        ...(existingLicense.metadata as object || {}),
                        lastRenewalOrderId: order.id
                    }
                }
            });

            console.log(`[SOFTWARE_LICENSE_PROVISION] Sukses memperpanjang lisensi ${existingLicense.key} hingga ${newExpiresAt}`);
        } else {
            // ALUR PEMBUATAN LISENSI BARU
            const licenseKey = generateKey();
            console.log(`[SOFTWARE_LICENSE_PROVISION] Membuat lisensi baru untuk Produk: ${product.name} (Key: ${licenseKey})`);

            await prisma.license.create({
                data: {
                    key: licenseKey,
                    productId: product.id,
                    userId: order.userId,
                    status: "active",
                    maxActivations: product.maxActivations,
                    expiresAt: expiresAt,
                    metadata: {
                        initialOrderId: order.id
                    }
                }
            });

            console.log(`[SOFTWARE_LICENSE_PROVISION] Sukses menerbitkan lisensi baru: ${licenseKey}`);
        }
    } catch (error) {
        console.error(`[SOFTWARE_LICENSE_PROVISION_ERROR] Gagal memproses lisensi order ${orderId}:`, error);
    }
}
