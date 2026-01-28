import { toast } from "sonner";
import { Building, Copy, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";
import type { MidtransPaymentData, SelectedPaymentMethod } from "@/types/payment";

interface MidtransPaymentProps {
    orderId: string;
    paymentData: MidtransPaymentData;
    selectedMethod: SelectedPaymentMethod | null;
    onClose: () => void;
}

export function MidtransPayment({ orderId, paymentData, selectedMethod, onClose }: MidtransPaymentProps) {
    const router = useRouter();

    const handleCheckStatus = async () => {
        try {
            toast.loading("Checking payment status...", { id: "check-status" });
            const res = await fetch(`/api/payment/status?orderId=${orderId}&mode=json`);
            const data = await res.json();

            if (data.status === 'settled' || data.status === 'paid' || data.status === 'waiting_verification') {
                toast.success("Status Updated!", { id: "check-status" });
                onClose();
                router.refresh();
            } else {
                toast.info("Status not yet updated.", { id: "check-status" });
            }
        } catch {
            toast.error("Failed to check status", { id: "check-status" });
        }
    };

    return (
        <div className="py-2">
            <div className="space-y-6">

                {/* QRIS DISPLAY */}
                {['qris', 'gopay'].includes(paymentData.payment_type) && paymentData.actions && (
                    <div className="text-center bg-white p-6 rounded-xl border-4 border-lime-500/20">
                        <div className="mx-auto w-[220px] h-[220px]">
                            <QRCode
                                value={paymentData.actions[0].url}
                                size={220}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            />
                        </div>
                        <div className="mt-6 flex flex-col gap-1">
                            <p className="text-black font-bold text-lg">Scan to Pay</p>
                            <p className="text-zinc-500 text-sm">Valid for 15 minutes</p>
                        </div>
                    </div>
                )}

                {/* VA DISPLAY */}
                {(paymentData.va_numbers || paymentData.permata_va_number) && (
                    <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center">
                                <Building className="w-6 h-6 text-lime-400" />
                            </div>
                            <div>
                                <div className="text-white font-bold uppercase text-lg">{selectedMethod?.label || paymentData.va_numbers?.[0]?.bank || "Bank Transfer"}</div>
                                <div className="text-sm text-zinc-500">Virtual Account</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">Account Number</label>
                            <div className="flex items-center gap-2 bg-black p-4 rounded-lg border border-zinc-800">
                                <span className="text-xl sm:text-2xl font-mono text-white font-bold tracking-wider flex-1 break-all">
                                    {paymentData.permata_va_number || paymentData.va_numbers?.[0].va_number}
                                </span>
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => {
                                    const vaNumber = paymentData.permata_va_number || paymentData.va_numbers?.[0]?.va_number;
                                    if (vaNumber) navigator.clipboard.writeText(vaNumber);
                                    toast.success("Copied!");
                                }}>
                                    <Copy className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <p className="text-sm text-amber-200/80 leading-relaxed">
                                Please transfer the <strong>exact amount</strong> to the virtual account number above. Verification is automatic.
                            </p>
                        </div>
                    </div>
                )}

                {/* Mandiri Bill */}
                {paymentData.payment_type === 'echannel' && (
                    <div className="space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-lime-400" />
                                Mandiri Bill Payment
                            </div>

                            <div className="bg-black p-4 rounded-lg space-y-4 border border-zinc-800">
                                <div>
                                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Company Code</div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-xl font-mono text-white font-bold">{paymentData.biller_code}</div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={() => {
                                            if (paymentData.biller_code) navigator.clipboard.writeText(paymentData.biller_code);
                                            toast.success("Copied!");
                                        }}>
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-zinc-800" />
                                <div>
                                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Bill Key</div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-xl font-mono text-white font-bold">{paymentData.bill_key}</div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={() => {
                                            if (paymentData.bill_key) navigator.clipboard.writeText(paymentData.bill_key);
                                            toast.success("Copied!");
                                        }}>
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CStore */}
                {paymentData.payment_type === 'cstore' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                            <Store className="w-6 h-6 text-lime-400" />
                            <div className="text-white font-bold capitalize text-xl">{paymentData.store} Payment</div>
                        </div>

                        <div className="text-center py-8 bg-white rounded-lg border-4 border-lime-500/20">
                            <div className="text-black text-4xl font-bold font-mono tracking-[0.2em]">{paymentData.payment_code}</div>
                            <div className="text-sm text-zinc-500 mt-2 font-medium">Show this code to the cashier</div>
                        </div>

                        <div className="text-sm text-zinc-400 text-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                            Please complete payment at the nearest store before time expires.
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-900">
                    <Button
                        className="w-full bg-lime-500 text-black hover:bg-lime-400 font-bold"
                        onClick={handleCheckStatus}
                    >
                        I Have Paid
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white">
                        Close Instructions
                    </Button>
                </div>
            </div>
        </div>
    );
}
