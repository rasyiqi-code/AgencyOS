"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { 
    Key, Globe, Copy, Check, Trash2, Plus, ArrowRight, Loader2, Sparkles, CreditCard, ShoppingCart, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { 
    activateUserLicenseDomain, deactivateUserLicenseDomain, buySoftwareLicense 
} from "@/app/actions/licenses";
import { PaymentSelector } from "@/components/payment/payment-selector";

interface UserLicenseClientProps {
    initialLicenses: any[];
    availableProducts: any[];
    bankDetails?: { bank_name?: string; bank_account?: string; bank_holder?: string };
    gatewayStatus?: { midtrans: boolean; creem: boolean };
    hasActiveGateway?: boolean;
    contactWA?: string | null;
    contactTele?: string | null;
    user: { displayName: string | null; email: string | null };
}

export function UserLicenseClient({ 
    initialLicenses, 
    availableProducts,
    bankDetails,
    gatewayStatus,
    hasActiveGateway,
    contactWA,
    contactTele,
    user
}: UserLicenseClientProps) {
    const [activeTab, setActiveTab] = useState<"my-licenses" | "buy-software">("my-licenses");
    const [licenses, setLicenses] = useState(initialLicenses);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Input state domain baru
    const [newDomains, setNewDomains] = useState<Record<string, string>>({});
    const [processingDomainId, setProcessingDomainId] = useState<string | null>(null);
    const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);

    // State transaksi aktif untuk modal pembayaran dinamis
    const [activeOrder, setActiveOrder] = useState<{
        orderId: string;
        amount: number;
        currency: 'USD' | 'IDR';
    } | null>(null);
    const [activeOrderStatus, setActiveOrderStatus] = useState<string>("pending");

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        toast.success("Kunci lisensi disalin!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleAddDomain = async (licenseId: string) => {
        const domain = newDomains[licenseId];
        if (!domain || !domain.trim()) {
            toast.error("Nama domain tidak boleh kosong");
            return;
        }

        setProcessingDomainId(licenseId);
        const res = await activateUserLicenseDomain(licenseId, domain);
        setProcessingDomainId(null);

        if (res.success) {
            toast.success("Domain berhasil diaktivasi!");
            setNewDomains(prev => ({ ...prev, [licenseId]: "" }));
            // Reload page to reflect changes
            window.location.reload();
        } else {
            toast.error(res.error || "Gagal mengaktifkan domain");
        }
    };

    const handleRemoveDomain = async (licenseId: string, activationId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus domain ini?")) return;

        startTransition(async () => {
            const res = await deactivateUserLicenseDomain(licenseId, activationId);
            if (res.success) {
                toast.success("Domain dinonaktifkan");
                window.location.reload();
            } else {
                toast.error(res.error || "Gagal menonaktifkan domain");
            }
        });
    };

    const handlePayment = async (productId: string) => {
        setCheckoutProductId(productId);
        const res = await buySoftwareLicense(productId);
        setCheckoutProductId(null);
        
        if (!res.success || !res.orderId || !res.amount || !res.currency) {
            toast.error(res.error || "Gagal memproses order pembelian.");
            return;
        }

        // Buka panel pembayaran dinamis sesuai gerbang aktif
        setActiveOrder({
            orderId: res.orderId,
            amount: res.amount,
            currency: res.currency as 'USD' | 'IDR'
        });
        setActiveOrderStatus("pending");
    };

    return (
        <div className="space-y-6">
            {/* Payment Modal/Overlay if activeOrder exists */}
            {activeOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-3xl shadow-2xl relative animate-scale-up">
                        <button onClick={() => setActiveOrder(null)} className="absolute right-4 top-4 text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-bold text-white mb-4">Selesaikan Pembayaran</h2>
                        <PaymentSelector 
                            orderId={activeOrder.orderId}
                            amount={activeOrder.amount}
                            currency={activeOrder.currency}
                            bankDetails={bankDetails}
                            gatewayStatus={gatewayStatus}
                            contactWA={contactWA}
                            contactTele={contactTele}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Key className="w-6 h-6 text-yellow-500 animate-pulse" />
                    Pusat Lisensi & Software
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Kelola domain aktif untuk plugin/tema Anda, atau beli software siap pakai kami.
                </p>
            </div>

            {/* Tabs Trigger */}
            <div className="flex border-b border-white/5 gap-4">
                <button
                    onClick={() => setActiveTab("my-licenses")}
                    className={`pb-3 text-sm font-semibold tracking-wider transition-colors relative ${
                        activeTab === "my-licenses" ? "text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    Lisensi Saya ({licenses.length})
                    {activeTab === "my-licenses" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("buy-software")}
                    className={`pb-3 text-sm font-semibold tracking-wider transition-colors relative ${
                        activeTab === "buy-software" ? "text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    Beli Software ({availableProducts.length})
                    {activeTab === "buy-software" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
                    )}
                </button>
            </div>

            {/* Content Tabs */}
            {activeTab === "my-licenses" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {licenses.length === 0 ? (
                        <div className="col-span-full rounded-xl border border-white/5 bg-zinc-900/20 p-12 text-center text-zinc-500">
                            <Key className="w-12 h-12 mx-auto mb-4 text-zinc-600 opacity-50" />
                            Anda belum memiliki lisensi produk apa pun. Silakan kunjungi tab <button onClick={() => setActiveTab("buy-software")} className="text-yellow-500 underline font-semibold">Beli Software</button>.
                        </div>
                    ) : (
                        licenses.map((lic) => {
                            const isExpired = lic.expiresAt && new Date(lic.expiresAt) < new Date();
                            return (
                                <div key={lic.id} className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col justify-between shadow-lg relative group overflow-hidden">
                                    {/* Glowing top border on hover */}
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{lic.product.name}</h3>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                                                    {lic.product.interval === "one_time" ? "Lifetime License" : `${lic.product.interval} Billing`}
                                                </span>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                lic.status === "active" 
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                    : lic.status === "suspended"
                                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            }`}>
                                                {lic.status}
                                            </span>
                                        </div>

                                        {/* License Key Box */}
                                        <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-4 font-mono">
                                            <span className="text-yellow-400/90 font-semibold select-all text-xs tracking-widest truncate">{lic.key}</span>
                                            <button 
                                                onClick={() => handleCopy(lic.key)}
                                                className="text-zinc-500 hover:text-white shrink-0 p-1 rounded hover:bg-white/5 transition-colors"
                                            >
                                                {copiedKey === lic.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>

                                        {/* Activations List */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                                <span>Aktivasi Domain</span>
                                                <span>{lic.activations.length} / {lic.maxActivations}</span>
                                            </div>

                                            {lic.activations.length > 0 && (
                                                <div className="space-y-1.5">
                                                    {lic.activations.map((act: any) => (
                                                        <div key={act.id} className="flex justify-between items-center bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
                                                            <span className="flex items-center gap-2 font-mono">
                                                                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                                                                {act.domain}
                                                            </span>
                                                            <button 
                                                                onClick={() => handleRemoveDomain(lic.id, act.id)}
                                                                className="text-zinc-500 hover:text-rose-400 p-0.5 rounded hover:bg-white/5 transition-colors"
                                                                title="Nonaktifkan domain"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add Domain Form */}
                                            {lic.status === "active" && lic.activations.length < lic.maxActivations && (
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="my-domain.com"
                                                        value={newDomains[lic.id] || ""}
                                                        onChange={(e) => setNewDomains(prev => ({ ...prev, [lic.id]: e.target.value }))}
                                                        className="h-8 text-xs bg-black/20 border-white/5 focus-visible:ring-yellow-500/20"
                                                    />
                                                    <Button 
                                                        size="sm" onClick={() => handleAddDomain(lic.id)}
                                                        disabled={processingDomainId === lic.id}
                                                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold h-8 text-xs shrink-0"
                                                    >
                                                        {processingDomainId === lic.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                                                        Tambah
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Expiration / Renewal */}
                                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                        <span className="text-zinc-500">
                                            {lic.expiresAt ? (
                                                <>Exp: {new Date(lic.expiresAt).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}</>
                                            ) : (
                                                <>Lifetime License</>
                                            )}
                                        </span>
                                        {isExpired && (
                                            <Button
                                                size="sm" 
                                                onClick={() => handlePayment(lic.productId)}
                                                disabled={checkoutProductId === lic.productId}
                                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-7 text-[10px] uppercase gap-1"
                                            >
                                                {checkoutProductId === lic.productId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                                Perpanjang
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableProducts.length === 0 ? (
                        <div className="col-span-full rounded-xl border border-white/5 bg-zinc-900/20 p-12 text-center text-zinc-500">
                            Belum ada produk software yang siap dijual. Hubungi administrator.
                        </div>
                    ) : (
                        availableProducts.map((prod) => (
                            <div key={prod.id} className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col justify-between shadow-lg relative group overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div>
                                    <h3 className="font-bold text-white text-lg">{prod.name}</h3>
                                    <p className="text-zinc-400 text-xs mt-2 min-h-[50px] leading-relaxed">
                                        {prod.description || "Tidak ada deskripsi produk."}
                                    </p>
                                    
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs text-zinc-500">Harga</span>
                                            <span className="text-2xl font-black text-white">
                                                <PriceDisplay amount={prod.price} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                            <span>Masa Aktif</span>
                                            <span>{prod.interval === "one_time" ? "Lifetime (Sekali Bayar)" : `${prod.interval}`}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                            <span>Kuota Domain</span>
                                            <span>{prod.maxActivations} Domain</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handlePayment(prod.id)}
                                    disabled={checkoutProductId === prod.id}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 mt-6 shadow-lg shadow-blue-500/10 gap-2 transition-transform active:scale-95"
                                >
                                    {checkoutProductId === prod.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            Beli Lisensi Sekarang
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
