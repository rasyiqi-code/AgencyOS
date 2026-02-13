
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Package className="w-8 h-8 text-brand-yellow" />
                        Products
                    </h1>
                    <p className="text-zinc-400 mt-2">
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
