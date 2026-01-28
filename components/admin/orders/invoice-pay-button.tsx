"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import "@/types/payment"; // Window.snap type augmentation

interface InvoicePayButtonProps {
    orderId: string;
    snapToken?: string | null;
    amount: number;
}

export function InvoicePayButton({ orderId, snapToken, amount }: InvoicePayButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        console.log(`Debug: Processing payment for Order #${orderId}, Amount: ${amount}`);
        try {
            const token = snapToken;

            // If no token exists, we might need to regenerate it (future improvement)
            // For now, assume token exists if order is created via checkout API
            if (!token) {
                toast.error("Payment token missing. Please contact support.");
                return;
            }

            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: async (result: unknown) => {
                        toast.success("Pembayaran berhasil!");
                        console.log("Success", result);
                        // Refresh page to show paid status
                        window.location.reload();
                    },
                    onPending: (result: unknown) => {
                        toast.info("Pembayaran menunggu verifikasi.");
                        console.log("Pending", result);
                    },
                    onError: (result: unknown) => {
                        toast.error("Pembayaran gagal.");
                        console.error("Error", result);
                    },
                    onClose: () => {
                        toast.warning("Anda menutup jendela pembayaran.");
                    },
                });
            } else {
                toast.error("Payment gateway not loaded.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-lg shadow-lg shadow-emerald-900/20"
            onClick={handlePayment}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
                <CreditCard className="w-5 h-5 mr-2" />
            )}
            Bayar Sekarang
        </Button>
    );
}
