import { stackServerApp } from "@/lib/config/stack";
import { getClientLicenses } from "@/app/actions/licenses";
import { LicenseCard } from "@/components/dashboard/my-products/license-card";
import { Package } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Halaman "My Products" di Client Dashboard.
 * Menampilkan semua produk digital yang telah dibeli beserta lisensinya.
 * Client bisa melihat, menyalin, dan me-regenerasi license key mereka.
 */
export default async function MyProductsPage() {
    const user = await stackServerApp.getUser();

    // Redirect ke login jika belum autentikasi
    if (!user) {
        redirect("/handler/sign-in");
    }

    // Ambil semua lisensi milik user yang sedang login (userId diambil dari session secara internal)
    const result = await getClientLicenses();
    const licenses = result.success ? (result.licenses || []) : [];

    return (
        <div className="space-y-6 py-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Package className="w-6 h-6 text-brand-yellow" />
                    Produk Saya
                </h1>
                <p className="text-zinc-400 mt-1">
                    Kelola lisensi dan unduh produk digital yang telah Anda beli.
                </p>
            </div>

            {/* License Cards Grid */}
            {licenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-xl">
                    <Package className="w-12 h-12 text-zinc-700 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400">Belum ada produk</h3>
                    <p className="text-sm text-zinc-600 mt-1">
                        Produk digital yang Anda beli akan muncul di sini.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {licenses.map((license) => (
                        <LicenseCard
                            key={license.id}
                            license={{
                                ...license,
                                expiresAt: license.expiresAt ? license.expiresAt.toISOString() : null,
                                currentActivations: license.activations,
                                product: {
                                    ...license.product,
                                    // Fallback untuk field yang mungkin belum ada di Prisma client lama
                                    image: license.product?.image || null,
                                    fileUrl: license.product?.fileUrl || null,
                                    purchaseType: license.product?.purchaseType || "one_time",
                                },
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
