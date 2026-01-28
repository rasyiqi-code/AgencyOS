"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PurchaseButtonProps {
    serviceId: string;
    interval: string;
    className?: string;
}

export function PurchaseButton({ serviceId, interval, className }: PurchaseButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/store/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serviceId })
            });

            const data = await res.json();

            if (res.status === 401) {
                // Store serviceId in sessionStorage for post-login checkout
                sessionStorage.setItem('pendingServiceCheckout', serviceId);
                toast.error("Please sign in to purchase");
                router.push(`/handler/sign-in?callbackUrl=${encodeURIComponent('/services?action=checkout')}`);
                return;
            }

            if (!res.ok) throw new Error(data.error || "Failed to create order");

            if (data.url) {
                router.push(data.url);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to process purchase. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={(e) => {
                e.preventDefault();
                handlePurchase();
            }}
            disabled={loading}
            className={`w-full bg-white text-black hover:bg-zinc-200 font-bold h-11 text-sm rounded-xl transition-transform active:scale-[0.98] ${className}`}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Purchase {interval === 'one_time' ? 'Package' : 'Plan'}
        </Button>
    );
}
