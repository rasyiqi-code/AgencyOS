"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Wallet, CheckCircle2, Lock, CreditCard, Building, Smartphone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "next-intl";

import { initiateCreemPayment } from "@/components/payment/creem/client";
import { ManualPayment } from "@/components/payment/manual/manual-payment";
import { MidtransPayment } from "@/components/payment/midtrans/midtrans-payment";
import { PaymentMethodItem } from "@/components/payment/payment-method-item";
import { PaymentPendingState } from "@/components/payment/payment-pending-state";
import { VerificationInProgress } from "@/components/payment/verification-in-progress";

import type { MidtransPaymentData, CreemPaymentMetadata, BankDetails, SelectedPaymentMethod } from "@/types/payment";

export interface PaymentSelectorProps {
    orderId: string;
    amount: number;
    paymentMetadata?: MidtransPaymentData | CreemPaymentMetadata | null;
    allowedGroups?: string[];
    currency?: 'USD' | 'IDR';
    bankDetails?: BankDetails;
    orderStatus?: string;
    chargeEndpoint?: string;
    contactWA?: string | null;
    contactTele?: string | null;
    hasActiveGateway?: boolean;
    gatewayStatus?: { midtrans: boolean; creem: boolean };
    noCard?: boolean;
    onPaymentInitiated?: () => void;
    onPaymentClosed?: () => void; // Callback ketika proses pembayaran dibatalkan atau ditutup
    onPaymentStatusChange?: (status: string) => void; // Callback ketika status pembayaran berubah
}

interface PaymentMethod {
    id: string;
    label: string;
    type: string;
    disabled?: boolean;
}

// Data statis konfigurasi grup metode pembayaran
const PAYMENT_GROUPS: { id: string; label: string; icon: React.ElementType; methods: PaymentMethod[] }[] = [
    {
        id: "card",
        label: "Credit / Debit Card",
        icon: CreditCard,
        methods: [
            { id: "cc", label: "Visa / Mastercard / JCB", type: "credit_card", disabled: false },
        ]
    },
    {
        id: "manual",
        label: "Bank / Wire Transfer",
        icon: Building,
        methods: [
            { id: "wise", label: "Wise / Bank Transfer (USD)", type: "manual_transfer" }
        ]
    },
    {
        id: "va",
        label: "Virtual Account (IDR Only)",
        icon: Building,
        methods: [
            { id: "bca", label: "BCA Virtual Account", type: "bank_transfer" },
            { id: "mandiri", label: "Mandiri Bill", type: "echannel" },
            { id: "bni", label: "BNI Virtual Account", type: "bank_transfer" },
            { id: "bri", label: "BRI Virtual Account", type: "bank_transfer" },
            { id: "permata", label: "Permata Virtual Account", type: "permata" },
            { id: "cimb", label: "CIMB Virtual Account", type: "bank_transfer" },
            { id: "danamon", label: "Danamon Virtual Account", type: "bank_transfer" },
            { id: "bsi", label: "BSI Virtual Account", type: "bank_transfer" },
        ]
    },
    {
        id: "ewallet",
        label: "E-Wallet & QRIS (IDR Only)",
        icon: Smartphone,
        methods: [
            { id: "gopay", label: "GoPay / GoPay Later", type: "gopay" },
            { id: "shopeepay", label: "ShopeePay", type: "shopeepay" },
            { id: "qris", label: "QRIS (Dana, OVO, LinkAja, GPay)", type: "qris" },
        ]
    },
    {
        id: "cstore",
        label: "Convenience Store",
        icon: Store,
        methods: [
            { id: "indomaret", label: "Indomaret", type: "cstore" },
            { id: "alfamart", label: "Alfamart / Alfamidi", type: "cstore" },
        ]
    },
];

export function PaymentSelector({
    orderId,
    amount,
    paymentMetadata,
    allowedGroups,
    currency = 'USD',
    bankDetails,
    orderStatus,
    chargeEndpoint,
    contactWA,
    contactTele,
    hasActiveGateway = true,
    gatewayStatus,
    noCard,
    onPaymentInitiated,
    onPaymentClosed,
    onPaymentStatusChange
}: PaymentSelectorProps) {
    const locale = useLocale();
    const isId = locale === 'id';
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<SelectedPaymentMethod | null>(null);

    const [paymentData, setPaymentData] = useState<MidtransPaymentData | CreemPaymentMetadata | null>(() => {
        if (!paymentMetadata) return null;
        if ('payment_type' in paymentMetadata || 'transaction_id' in paymentMetadata || 'status_code' in paymentMetadata) {
            return paymentMetadata;
        }
        return null;
    });

    // Menambahkan state untuk memantau apakah pembayaran ditunda (pending) dan bukti telah diunggah
    const [isPending, setIsPending] = useState<boolean>(false);
    const [hasUploadedProof, setHasUploadedProof] = useState<boolean>(() => {
        // Jika statusnya sudah waiting_verification, bukti otomatis dianggap sudah diunggah
        return orderStatus === 'waiting_verification';
    });

    const isVerifying = orderStatus === 'waiting_verification';

    // Logika pemfilteran metode pembayaran berdasarkan ketersediaan gateway dan mata uang
    let availableGroups = PAYMENT_GROUPS;
    if (currency === 'USD') {
        availableGroups = PAYMENT_GROUPS.filter(g => ['card', 'manual'].includes(g.id));
    }

    let filteredGroups = availableGroups;
    if (!bankDetails) {
        filteredGroups = filteredGroups.filter(g => g.id !== 'manual');
    }
    if (!hasActiveGateway) {
        filteredGroups = filteredGroups.filter(g => g.id === 'manual');
    }
    if (gatewayStatus) {
        if (!gatewayStatus.midtrans) {
            filteredGroups = filteredGroups.filter(g => !['va', 'ewallet', 'cstore'].includes(g.id));
        }
        if (!gatewayStatus.creem) {
            filteredGroups = filteredGroups.filter(g => g.id !== 'card');
        }
    }
    if (allowedGroups) {
        filteredGroups = filteredGroups.filter(g => allowedGroups.includes(g.id));
    }

    // Mengubah Wise menjadi Local Bank Indonesia jika mata uang yang digunakan adalah IDR
    const mappedGroups = filteredGroups.map(group => {
        if (group.id === "manual") {
            return {
                ...group,
                methods: group.methods.map(method => {
                    if (method.id === "wise") {
                        if (currency === "IDR") {
                            const bankLabel = bankDetails?.bank_name
                                ? `Transfer Bank ${bankDetails.bank_name}`
                                : "Transfer Bank Manual";
                            return {
                                ...method,
                                id: "local_bank",
                                label: bankLabel,
                            };
                        } else {
                            return {
                                ...method,
                                label: "Wise / Bank Transfer (USD)",
                            };
                        }
                    }
                    return method;
                })
            };
        }
        return group;
    });

    const handleCharge = async () => {
        if (!selectedMethod) return;
        setLoading(true);

        // 1. PENANGANAN TRANSFER MANUAL
        if (selectedMethod.type === 'manual_transfer') {
            const manualData = {
                payment_type: 'manual_transfer',
                status_code: '201',
                transaction_status: 'pending'
            };

            try {
                await fetch("/api/billing/method", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, paymentType: 'manual_transfer', metadata: manualData })
                });

                setPaymentData(manualData);
                setIsDialogOpen(true);
                onPaymentInitiated?.();
                toast.success(isId ? "Pilihan pembayaran berhasil disimpan" : "Please complete your transfer");
            } catch (error) {
                console.error(error);
                toast.error(isId ? "Gagal memilih metode pembayaran" : "Failed to select payment method");
            } finally {
                setLoading(false);
            }
            return;
        }

        // 2. PENANGANAN KARTU KREDIT (CREEM GATEWAY)
        if (selectedMethod.id === 'cc') {
            try {
                const data = await initiateCreemPayment(orderId);
                onPaymentInitiated?.();
                window.location.href = data.checkout_url;
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : "Payment initialization failed");
                setLoading(false);
            }
            return;
        }

        // 3. PENANGANAN GATEWAY CORE (MIDTRANS - VA, QRIS, CSTORE)
        try {
            const endpoint = chargeEndpoint || "/api/payment/midtrans/charge";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    paymentType: selectedMethod.type,
                    bank: selectedMethod.type === 'bank_transfer' || selectedMethod.type === 'cstore' ? selectedMethod.id : undefined
                })
            });

            let data;
            const resClone = res.clone();
            try {
                data = await res.json();
            } catch {
                const text = await resClone.text();
                throw new Error(text || "Invalid server response");
            }

            if (!res.ok) throw new Error(data.message || "Payment Failed");

            setPaymentData(data);
            setIsDialogOpen(true);
            onPaymentInitiated?.();
            toast.success(isId ? "Pembayaran berhasil diinisiasi!" : "Payment initiated!");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    const isSelected = (id: string) => selectedMethod?.id === id;

    // State Verifikasi Pembayaran Sedang Berlangsung (Waiting Verification)
    if (isVerifying) {
        return <VerificationInProgress orderId={orderId} isId={isId} />;
    }

    // Menampilkan state tertunda dengan animasi spinner jika pengguna menutup petunjuk bayar
    if (isPending && paymentData) {
        return (
            <PaymentPendingState
                isId={isId}
                hasUploadedProof={hasUploadedProof}
                onContinue={() => setIsPending(false)}
                onCancel={async () => {
                    setPaymentData(null);
                    setIsPending(false);
                    onPaymentClosed?.();
                    try {
                        await fetch("/api/billing/method", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId, paymentType: 'cancel' })
                        });
                    } catch (e) {
                        console.error("Gagal membatalkan metode pembayaran:", e);
                    }
                }}
            />
        );
    }

    return (
        <>
            <div className={noCard ? "w-full flex flex-col h-fit" : "w-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-6 shadow-2xl flex flex-col h-fit max-h-[800px]"}>
                {!noCard && (
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
                        <Wallet className="w-5 h-5 text-brand-yellow" />
                        {isId ? "Metode Pembayaran" : "Payment Method"}
                    </h2>
                )}

                {!paymentData ? (
                    <>
                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-6">
                                {mappedGroups.map((group) => (
                                    <div key={group.id} className="space-y-3">
                                        <h3 className="text-[10px] uppercase text-zinc-500 font-extrabold tracking-[0.15em] pl-1 flex items-center gap-2">
                                            <group.icon className="w-3.5 h-3.5 text-zinc-500" />
                                            {group.label}
                                        </h3>
                                        <div className="grid gap-3">
                                            {group.methods.filter(m => !m.disabled).map((method) => (
                                                <PaymentMethodItem
                                                    key={method.id}
                                                    method={method}
                                                    active={isSelected(method.id)}
                                                    isId={isId}
                                                    onSelect={() => setSelectedMethod({
                                                        type: method.type,
                                                        bank: method.type === 'bank_transfer' ? method.id : undefined,
                                                        id: method.id,
                                                        label: method.label
                                                     })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Tombol Utama Bayar dengan Visual Premium */}
                        <div className="pt-5 mt-5 border-t border-zinc-800/80 shrink-0">
                            <Button
                                onClick={handleCharge}
                                disabled={!selectedMethod || loading}
                                className={`w-full h-11 text-xs font-bold transition-all duration-300 rounded-xl cursor-pointer tracking-wider uppercase flex items-center justify-center gap-2 ${
                                    !selectedMethod 
                                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed select-none opacity-60' 
                                    : 'bg-gradient-to-r from-brand-yellow via-amber-400 to-amber-500 hover:from-yellow-400 hover:via-amber-300 hover:to-amber-400 text-zinc-950 shadow-[0_0_20px_rgba(254,215,0,0.2)] hover:shadow-[0_0_30px_rgba(254,215,0,0.4)] hover:scale-[1.01] active:scale-[0.99] font-black shadow-lg'
                                }`}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        {!selectedMethod && <Lock className="w-3.5 h-3.5" />}
                                        {isId 
                                            ? `Bayar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount)}`
                                            : `Pay ${new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount)}`
                                        }
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    /* RENDER INLINE LANGSUNG DI SINI! (BUKAN MODAL) */
                    paymentData.payment_type === 'manual_transfer' ? (
                        <ManualPayment
                            orderId={orderId}
                            bankDetails={bankDetails}
                            onClose={() => {
                                setIsPending(true);
                            }}
                            onProofUploaded={() => setHasUploadedProof(true)}
                            contactWA={contactWA}
                            contactTele={contactTele}
                            onPaymentStatusChange={onPaymentStatusChange}
                        />
                    ) : (
                        <MidtransPayment
                            orderId={orderId}
                            paymentData={paymentData as MidtransPaymentData}
                            selectedMethod={selectedMethod}
                            onClose={() => {
                                setIsPending(true);
                            }}
                        />
                    )
                )}
            </div>
        </>
    );
}
