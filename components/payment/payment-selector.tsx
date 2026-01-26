import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Building, Wallet, CheckCircle2, Store, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { initiateCreemPayment } from "@/components/payment/creem/client";
import { selectPaymentMethod } from "@/app/actions/billing";
import { ManualPayment } from "@/components/payment/manual/manual-payment";
import { MidtransPayment } from "@/components/payment/midtrans/midtrans-payment";

export interface PaymentSelectorProps {
    orderId: string;
    amount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentMetadata?: any;
    allowedGroups?: string[];
    currency?: 'USD' | 'IDR';
    bankDetails?: {
        bank_name?: string;
        bank_account?: string;
        bank_holder?: string;
    };
    orderStatus?: string;
}

interface PaymentMethod {
    id: string;
    label: string;
    type: string;
    disabled?: boolean;
}

// Payment Method Groups
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

export function PaymentSelector({ orderId, amount, paymentMetadata, allowedGroups, currency = 'USD', bankDetails, orderStatus }: PaymentSelectorProps) {
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [paymentData, setPaymentData] = useState<any>(paymentMetadata || null);
    const [selectedMethod, setSelectedMethod] = useState<{ type: string, bank?: string, id: string, label?: string } | null>(null);

    // Check if waiting verification
    const isVerifying = orderStatus === 'waiting_verification';

    // Filter Payment Groups
    let availableGroups = PAYMENT_GROUPS;

    // Currency Filter
    if (currency === 'USD') {
        availableGroups = PAYMENT_GROUPS.filter(g => ['card', 'manual'].includes(g.id));
    }

    const filteredGroups = allowedGroups
        ? availableGroups.filter(g => allowedGroups.includes(g.id))
        : availableGroups;

    const handleCharge = async () => {
        if (!selectedMethod) return;
        setLoading(true);

        // MANUAL TRANSFER HANDLER
        if (selectedMethod.type === 'manual_transfer') {
            const manualData = {
                payment_type: 'manual_transfer',
                status_code: '201',
                transaction_status: 'pending'
            };

            try {
                // Persist selection to DB
                await selectPaymentMethod(orderId, 'manual_transfer', manualData);

                setPaymentData(manualData);
                toast.success("Please complete your transfer");
            } catch (error) {
                console.error(error);
                toast.error("Failed to select payment method");
            } finally {
                setLoading(false);
            }
            return;
        }

        // CREEM HANDLER: CREDIT CARD
        if (selectedMethod.id === 'cc') {
            try {
                const data = await initiateCreemPayment(orderId);
                window.location.href = data.checkout_url;
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : "Payment initialization failed");
                setLoading(false);
            }
            return;
        }

        // CORE API HANDLER (For VA, QRIS, CStore)
        try {
            const res = await fetch("/api/payment/midtrans/charge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    paymentType: selectedMethod.type,
                    bank: selectedMethod.type === 'bank_transfer' || selectedMethod.type === 'cstore' ? selectedMethod.id : undefined
                })
            });

            // Safely parse JSON or handle text errors
            let data;
            try {
                data = await res.json();
            } catch {
                const text = await res.text();
                throw new Error(text || "Invalid server response");
            }

            if (!res.ok) throw new Error(data.message || "Payment Failed");

            setPaymentData(data);
            toast.success("Payment initiated!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    // State for Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Auto-open dialog when paymentData is available and initial load happens
    useEffect(() => {
        if (paymentData) {
            setIsDialogOpen(true);
        }
    }, [paymentData]);

    // Helper to check selection
    const isSelected = (id: string) => selectedMethod?.id === id;

    if (isVerifying) {
        return (
            <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden p-8 shadow-xl flex flex-col items-center justify-center text-center h-[400px]">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification In Progress</h2>
                <p className="text-zinc-400 max-w-sm mx-auto">
                    We have received your payment proof. Our team is verifying it now. This usually takes less than 24 hours.
                </p>
                <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-sm text-zinc-500">
                    Order ID: <span className="text-zinc-300 font-mono">{orderId}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden p-6 shadow-xl flex flex-col h-[700px]">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
                    <Wallet className="w-5 h-5 text-lime-400" />
                    Payment Method
                </h2>

                {!paymentData ? (
                    <>
                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-6">
                                {filteredGroups.map((group) => (
                                    <div key={group.id} className="space-y-3">
                                        <h3 className="text-xs uppercase text-zinc-500 font-bold tracking-wider pl-1 flex items-center gap-2">
                                            <group.icon className="w-3 h-3" />
                                            {group.label}
                                        </h3>
                                        <div className="grid gap-2">
                                            {group.methods.filter(m => !m.disabled).map((method) => (
                                                <button
                                                    key={method.id}
                                                    disabled={method.disabled}
                                                    onClick={() => !method.disabled && setSelectedMethod({
                                                        type: method.type,
                                                        bank: method.type === 'bank_transfer' ? method.id : undefined,
                                                        id: method.id,
                                                        label: method.label
                                                    })}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group 
                                                    ${method.disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-900' : ''}
                                                    ${isSelected(method.id)
                                                            ? 'bg-lime-500/10 border-lime-500 ring-1 ring-lime-500/20 z-10'
                                                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${isSelected(method.id) ? 'bg-lime-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                            {method.id.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={`text-sm font-medium ${isSelected(method.id) ? 'text-lime-400' : 'text-zinc-200'} ${method.disabled ? 'text-zinc-600' : ''}`}>
                                                                {method.label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected(method.id) ? 'border-lime-500 bg-lime-500 text-black' : 'border-zinc-700 bg-zinc-900'}`}>
                                                        {isSelected(method.id) && <CheckCircle2 className="w-3 h-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="pt-4 mt-4 border-t border-zinc-900 shrink-0">
                            <Button
                                onClick={handleCharge}
                                disabled={!selectedMethod || loading}
                                className={`w-full h-12 text-lg font-bold transition-all ${!selectedMethod ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-lime-500 hover:bg-lime-400 text-black shadow-lg shadow-lime-900/20'}`}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency }).format(amount)}`}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 animate-pulse">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Payment Pending</h3>
                            <p className="text-zinc-400 text-sm mt-1">Please complete your payment.</p>
                        </div>

                        <Button
                            className="bg-lime-500 text-black hover:bg-lime-400 font-bold shadow-lg shadow-lime-900/20"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Continue to Payment
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-500 hover:text-white"
                            onClick={() => setPaymentData(null)}
                        >
                            Cancel / Change Method
                        </Button>
                    </div>
                )}
            </div>

            {/* PAYMENT INSTRUCTIONS DIALOG */}
            {paymentData && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <CheckCircle2 className="w-6 h-6 text-lime-400" />
                                Payment Instructions
                            </DialogTitle>
                        </DialogHeader>

                        {/* RENDER MODULAR COMPONENT BASED ON TYPE */}
                        {paymentData.payment_type === 'manual_transfer' ? (
                            <ManualPayment
                                orderId={orderId}
                                bankDetails={bankDetails}
                                onClose={() => setIsDialogOpen(false)}
                            />
                        ) : (
                            <MidtransPayment
                                orderId={orderId}
                                paymentData={paymentData}
                                selectedMethod={selectedMethod}
                                onClose={() => setIsDialogOpen(false)}
                            />
                        )}

                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
