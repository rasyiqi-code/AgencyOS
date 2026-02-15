"use client";

import { useState } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export function UploadProof({ estimateId, className }: { estimateId: string, className?: string }) {
    const t = useTranslations("Checkout");
    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("estimateId", estimateId);

        try {
            const res = await fetch("/api/billing/proof", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            toast.success(t('proofUploaded'));
            setIsUploaded(true);
        } catch (error) {
            console.error(error);
            toast.error(t('proofFail'));
        } finally {
            setIsUploading(false);
        }
    }

    if (isUploaded) {
        return (
            <div className={`flex items-center justify-center gap-2 text-emerald-500 font-medium ${className}`}>
                <Check className="w-4 h-4" />
                <span>{t('proofStatus')}</span>
            </div>
        );
    }

    return (
        <div className={className}>
            <label
                htmlFor="proof-upload"
                className={`flex items-center justify-center gap-2 cursor-pointer w-full h-full ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? t('uploading') : t('uploadProof')}
            </label>
            <Input
                id="proof-upload"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
            />
        </div>
    );
}
