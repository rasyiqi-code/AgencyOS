"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { clientGenerateRenewalInvoice } from "@/app/dashboard/(client)/billing/actions";


export function ClientRenewButton({ 
    projectId
}: { 
    projectId: string; 
}) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRenew = async () => {
        setIsLoading(true);
        try {
            const result = await clientGenerateRenewalInvoice(projectId);

            if (result.success && result.estimateId) {
                toast.success("Invoice generated! Redirecting to checkout...");
                router.push(`/id/checkout/${result.estimateId}`);
            } else {
                toast.error(result.error || "Failed to process renewal.");
                setIsLoading(false);
            }
        } catch {
            toast.error("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <Button 
            onClick={handleRenew} 
            disabled={isLoading}
            className="bg-brand-yellow hover:bg-brand-yellow/80 text-black font-bold w-full sm:w-auto"
        >
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 
            <>
                Perpanjang Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
            </>}
        </Button>
    );
}
