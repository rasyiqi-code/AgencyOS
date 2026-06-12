"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Building, Copy, Upload, CheckCircle2, MessageCircle, Send } from "lucide-react";
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
    contactWA?: string | null;
    contactTele?: string | null;
    onPaymentStatusChange?: (status: string) => void;
    onProofUploaded?: () => void;
}

export function ManualPayment({ orderId, bankDetails, onClose, contactWA, contactTele, onPaymentStatusChange, onProofUploaded }: ManualPaymentProps) {
    const t = useTranslations("Checkout"); // Using Checkout context for simplicity or add ManualPayment context
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
            onProofUploaded?.();
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload proof");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="py-2">
            {/* Mengurangi gap antar kolom agar tata letak lebih kompak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Bank Details */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-800">
                        <Building className="w-6 h-6 text-brand-yellow" />
                        <div className="text-white font-bold text-lg">Bank / Wise Transfer</div>
                    </div>

                    {/* Mengurangi padding (p-6 -> p-4.5) dan space-y (space-y-5 -> space-y-3.5) */}
                    <div className="bg-zinc-900 border border-zinc-800 p-4.5 rounded-xl space-y-3.5">
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Bank Name</div>
                            <div className="text-white font-bold text-base">{bankDetails?.bank_name || "Wise / BCA (IDR accepted)"}</div>
                        </div>
                        <div className="w-full h-px bg-zinc-800" />
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Account Number</div>
                            <div className="flex items-center justify-between group">
                                <div className="text-xl font-mono text-white font-bold tracking-tight">{bankDetails?.bank_account || "1234567890"}</div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity" aria-label="Copy account number" onClick={() => {
                                    navigator.clipboard.writeText(bankDetails?.bank_account || "1234567890");
                                    toast.success("Copied!");
                                }}>
                                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                </Button>
                            </div>
                        </div>
                        <div className="w-full h-px bg-zinc-800" />
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Account Holder</div>
                            <div className="text-white font-medium text-base">{bankDetails?.bank_holder || "Agency Admin"}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload & Verify */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-800 md:border-transparent">
                        <div className="text-white font-bold text-lg md:hidden">Verification</div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Payment Verification</label>
                            <div className={`w-full relative flex items-center p-2.5 rounded-xl transition-all ${proofUploaded ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-black/40 border border-zinc-800 focus-within:border-brand-yellow/50 focus-within:ring-1 focus-within:ring-brand-yellow/20 hover:bg-black/60 group'}`}>
                                {!proofUploaded ? (
                                    <div className="w-full">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                        />
                                        <div className="flex items-center gap-2.5 w-full pointer-events-none">
                                            <div className="shrink-0 w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                                                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-yellow" /> : <Upload className="w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-yellow transition-colors" />}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1 pr-2">
                                                <span className="text-xs font-semibold text-white truncate max-w-full">
                                                    {isUploading ? "Uploading Proof..." : "Upload Transfer Proof"}
                                                </span>
                                                <span className="text-[9px] text-zinc-500 truncate max-w-full">
                                                    JPG, PNG or PDF
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 w-full animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2.5 w-full">
                                            <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1 pr-2">
                                                <span className="text-xs font-semibold text-emerald-500 truncate max-w-full">Proof Uploaded</span>
                                                <span className="text-[9px] text-zinc-500 truncate max-w-full">We will verify this shortly</span>
                                            </div>
                                        </div>
                                        {/* Tombol Selesai untuk mengunci status dan beralih ke Verifikasi */}
                                        <Button
                                            type="button"
                                            onClick={async () => {
                                                onPaymentStatusChange?.('waiting_verification');
                                                router.refresh();
                                            }}
                                            className="w-full mt-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                                        >
                                            {typeof window !== 'undefined' && window.location.pathname.split('/').includes('id') ? "Selesai & Konfirmasi" : "Done & Confirm"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Box Peringatan diposisikan lebih rapat */}
                        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex gap-2.5 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <p className="text-[11px] text-amber-200/80 leading-normal">
                                {t("manualWaitTime") || "Please allow up to 24 hours for manual verification."}
                            </p>
                        </div>

                        {/* WA - Tele Contact Buttons (Only if settings provided) */}
                        {(contactWA || contactTele) && (
                            <div className="space-y-2 pt-3 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-500 delay-150">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold text-center">
                                    {t("fastConfirmation") || "Fast Confirmation"}
                                </p>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {contactWA && (
                                        <Button
                                            variant="outline"
                                            className="h-9.5 text-xs border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all font-semibold rounded-lg"
                                            onClick={() => {
                                                const message = encodeURIComponent(`Halo, saya ingin konfirmasi pembayaran untuk Order #${orderId.slice(-8).toUpperCase()}`);
                                                window.open(`https://wa.me/${contactWA.replace(/\D/g, '')}?text=${message}`, '_blank');
                                            }}
                                        >
                                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                            WhatsApp
                                        </Button>
                                    )}
                                    {contactTele && (
                                        <Button
                                            variant="outline"
                                            className="h-9.5 text-xs border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all font-semibold rounded-lg"
                                            onClick={() => {
                                                const message = encodeURIComponent(`Halo, saya ingin konfirmasi pembayaran untuk Order #${orderId.slice(-8).toUpperCase()}`);
                                                window.open(`https://t.me/${contactTele.replace('@', '')}?text=${message}`, '_blank');
                                            }}
                                        >
                                            <Send className="w-3.5 h-3.5 mr-1.5" />
                                            Telegram
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-zinc-800/50">
                <Button
                    variant="ghost"
                    onClick={() => {
                        // Menutup detail pembayaran manual (akan beralih ke state pending/tertunda di komponen induk)
                        onClose();
                    }}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 text-xs"
                >
                    Close & Continue Later
                </Button>
            </div>
        </div>
    );
}
