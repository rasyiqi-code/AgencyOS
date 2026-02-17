
import { prisma } from "@/lib/config/db";
import { ProductList } from "@/components/admin/products/product-list";
import { ProductForm } from "@/components/admin/products/product-form";
import { ProductStats } from "@/components/admin/products/product-stats";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { licenses: true },
            },
        },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const topProduct = products.length > 0
        ? products.reduce((prev, current) => (prev._count.licenses > current._count.licenses) ? prev : current)
        : null;

    return (
        <div className="w-full py-1 md:py-4 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Package className="w-5 h-5 md:w-6 md:h-6 text-brand-yellow" />
                        Products
                    </h1>
                    <p className="text-zinc-500 font-medium text-[10px] md:text-sm">
                        Manage your digital products (templates, plugins).
                    </p>
                </div>
                <ProductForm />
            </div>

            <ProductStats
                totalProducts={totalProducts}
                activeProducts={activeProducts}
                topProduct={topProduct ? { name: topProduct.name, licenses: topProduct._count.licenses } : null}
            />

            <ProductList products={products} />
        </div>
    );
}
