import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { getSoftwareProducts } from "@/app/actions/software-products";
import { ProductClient } from "./product-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    if (!await isAdmin()) {
        redirect("/dashboard");
    }

    const products = await getSoftwareProducts();

    return (
        <div className="w-full">
            <ProductClient initialProducts={products} />
        </div>
    );
}
