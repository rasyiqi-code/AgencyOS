import { getDigitalOrders } from "@/app/actions/digital-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Halaman Admin - Digital Sales
 * Menampilkan daftar semua pembelian produk digital.
 */
export default async function DigitalSalesPage() {
    const result = await getDigitalOrders();
    const orders = result.orders || [];

    return (
        <div className="space-y-6 py-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-brand-yellow" />
                    Digital Product Sales
                </h1>
                <p className="text-zinc-400 mt-1">
                    Monitor semua transaksi pembelian produk digital.
                </p>
            </div>

            {(orders.length === 0) ? (
                <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                    Belum ada transaksi produk digital.
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order: any) => (
                        <Card key={order.id} className="border-zinc-800 bg-zinc-950 text-zinc-100">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base text-white">
                                        {order.product?.name || "Unknown Product"}
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className={
                                            order.status === 'PAID' ? "border-green-500 text-green-400"
                                                : order.status === 'PENDING' ? "border-yellow-500 text-yellow-400"
                                                    : "border-red-500 text-red-400"
                                        }
                                    >
                                        {order.status}
                                    </Badge>
                                </div>
                                <CardDescription className="text-zinc-500">
                                    {order.userEmail} • {new Date(order.createdAt).toLocaleDateString("id-ID")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between text-sm pt-0">
                                <div className="text-zinc-400">
                                    Amount: <span className="text-white font-semibold">${order.amount}</span>
                                </div>
                                {order.license && (
                                    <div className="text-zinc-400">
                                        License: <code className="text-brand-yellow text-xs">{order.license.key}</code>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
