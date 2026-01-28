"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Building, Copy, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { uploadOrderProof } from "@/app/actions/billing";
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
            const res = await fetch("/api/billing/proof", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Bank Details */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                        <Building className="w-6 h-6 text-lime-400" />
                        <div className="text-white font-bold text-xl">Bank / Wise Transfer</div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-5">
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Bank Name</div>
                            <div className="text-white font-bold text-lg">{bankDetails?.bank_name || "Wise / BCA (IDR accepted)"}</div>
                        </div>
                        <div className="w-full h-px bg-zinc-800" />
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Account Number</div>
                            <div className="flex items-center justify-between group">
                                <div className="text-2xl font-mono text-white font-bold tracking-tight">{bankDetails?.bank_account || "1234567890"}</div>
                                <Button size="icon" variant="ghost" className="opacity-70 group-hover:opacity-100 transition-opacity" onClick={() => {
                                    navigator.clipboard.writeText(bankDetails?.bank_account || "1234567890");
                                    toast.success("Copied!");
                                }}>
                                    <Copy className="w-4 h-4 text-zinc-400" />
                                </Button>
                            </div>
                        </div>
                        <div className="w-full h-px bg-zinc-800" />
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Account Holder</div>
                            <div className="text-white font-medium text-lg">{bankDetails?.bank_holder || "PT Crediblemark Agency"}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload & Verify */}
                <div className="space-y-6 flex flex-col">
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 md:border-transparent">
                        <div className="text-white font-bold text-xl md:hidden">Verification</div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-zinc-500 font-bold tracking-wider">Payment Verification</label>
                            <div className={`border border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center gap-3 transition-all h-[220px] ${proofUploaded ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-black hover:bg-zinc-900 cursor-pointer group'}`}>
                                {!proofUploaded ? (
                                    <>
                                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                            />
                                            <div className="flex flex-col items-center gap-3 pointer-events-none group-hover:scale-105 transition-transform duration-200">
                                                {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-lime-500" /> : <Upload className="w-8 h-8 text-zinc-400 group-hover:text-lime-400 transition-colors" />}
                                                <div className="text-center">
                                                    <span className="block text-sm font-bold text-zinc-200 group-hover:text-white mb-1">
                                                        {isUploading ? "Uploading Proof..." : "Upload Transfer Proof"}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 group-hover:text-zinc-400">Values JPG, PNG or PDF</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-emerald-500 animate-in zoom-in duration-300">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block font-bold text-lg">Proof Uploaded</span>
                                            <span className="text-xs text-emerald-400/70">We will verify this shortly</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <p className="text-xs text-amber-200/80 leading-relaxed">
                                Please allow up to 24 hours for manual verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 mt-2 border-t border-zinc-800/50">
                <Button
                    variant="ghost"
                    onClick={() => {
                        onClose();
                        if (proofUploaded) router.refresh();
                    }}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                    Close & Continue Later
                </Button>
            </div>
        </div>
    );
}
