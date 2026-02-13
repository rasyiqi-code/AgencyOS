
import { getDigitalProducts } from "@/app/actions/digital-products";
import { ProductCard } from "@/components/public/product-card";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const products = await getDigitalProducts(true);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Digital Products</h1>
                <p className="text-zinc-400">Premium templates and plugins for your agency.</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    No products available yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product as any} />
                    ))}
                </div>
            )}
        </div>
    );
}
