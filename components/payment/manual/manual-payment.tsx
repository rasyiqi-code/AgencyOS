"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Building, Copy, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadOrderProof } from "@/app/actions/billing";
import { useRouter } from "next/navigation";

interface ManualPaymentProps {
    orderId: string;
    bankDetails?: {
        bank_name?: string;
        bank_account?: string;
        bank_holder?: string;
    };
    onClose: () => void;
}

export function ManualPayment({ orderId, bankDetails, onClose }: ManualPaymentProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [proofUploaded, setProofUploaded] = useState(false);

    // Handle File Upload for Manual Transfer
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("orderId", orderId);

        try {
            await uploadOrderProof(formData);
            toast.success("Proof uploaded! Please click 'Confirm Payment' to notify us.");
            setProofUploaded(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload proof");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="py-2">
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <Building className="w-6 h-6 text-lime-400" />
                    <div className="text-white font-bold text-xl">Bank / Wise Transfer</div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                    <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bank Name</div>
                        <div className="text-white font-bold text-lg">{bankDetails?.bank_name || "Wise / BCA (IDR accepted)"}</div>
                    </div>
                    <div className="w-full h-px bg-zinc-800" />
                    <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Account Number</div>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-mono text-white font-bold">{bankDetails?.bank_account || "1234567890"}</div>
                            <Button size="icon" variant="ghost" onClick={() => {
                                navigator.clipboard.writeText(bankDetails?.bank_account || "1234567890");
                                toast.success("Copied!");
                            }}>
                                <Copy className="w-4 h-4 text-zinc-400" />
                            </Button>
                        </div>
                    </div>
                    <div className="w-full h-px bg-zinc-800" />
                    <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Account Holder</div>
                        <div className="text-white font-medium">{bankDetails?.bank_holder || "PT Crediblemark Agency"}</div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-2">
                    <label className="text-xs uppercase text-zinc-500 font-bold tracking-wider">Payment Verification</label>
                    <div className={`border border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-all ${proofUploaded ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-black hover:bg-zinc-900 cursor-pointer'}`}>
                        {!proofUploaded ? (
                            <>
                                <div className="relative w-full">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-lime-500" /> : <Upload className="w-6 h-6 text-zinc-400" />}
                                        <span className="text-sm font-medium text-zinc-300">
                                            {isUploading ? "Uploading..." : "Click to upload transfer proof"}
                                        </span>
                                        <span className="text-xs text-zinc-600">JPG, PNG or PDF</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-emerald-500">
                                <CheckCircle2 className="w-8 h-8" />
                                <span className="font-bold">Proof Uploaded Successfully</span>
                                <span className="text-xs text-zinc-500">We have received your proof.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <p className="text-sm text-amber-200/80 leading-relaxed">
                        After transfer, please upload the proof above. We will verify it shortly.
                    </p>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-900">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onClose();
                            if (proofUploaded) router.refresh();
                        }}
                        className="text-zinc-500 hover:text-white w-full"
                    >
                        Close Instructions
                    </Button>
                </div>
            </div>
        </div>
    );
}
