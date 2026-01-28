"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import "@/types/payment"; // Window.snap type augmentation

interface EmbeddedPaymentProps {
    orderId: string;
    snapToken: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmbeddedPayment({ orderId, snapToken }: EmbeddedPaymentProps) {
    const isEmbedInitialized = useRef(false);

    useEffect(() => {
        if (!snapToken || isEmbedInitialized.current) return;

        const initSnap = () => {
            if (window.snap) {
                console.log("Initializing Snap Embed for token:", snapToken);
                try {
                    window.snap.embed(snapToken, {
                        embedId: 'snap-container',
                        onSuccess: async (result: unknown) => {
                            toast.success("Pembayaran berhasil!");
                            console.log("Success", result);
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
                            console.log("Widget closed");
                        }
                    });
                    isEmbedInitialized.current = true;
                } catch (err) {
                    console.error("Snap Embed Error:", err);
                }
            } else {
                console.warn("Snap script not loaded yet, retrying...");
                setTimeout(initSnap, 1000);
            }
        };

        // Delay slightly to ensure DOM is ready
        setTimeout(initSnap, 500);

    }, [snapToken]);

    return (
        <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg border border-zinc-200">
            <div className="bg-zinc-50 border-b border-zinc-100 p-4">
                <h3 className="font-semibold text-zinc-700 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                    Secure Payment
                </h3>
            </div>
            <div id="snap-container" className="min-h-[500px] w-full relative">
                {/* Midtrans will inject content here */}
                {/* Fallback loading state if script is slow */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <span className="text-zinc-400 text-sm">Loading payment gateway...</span>
                </div>
            </div>
        </div>
    );
}
