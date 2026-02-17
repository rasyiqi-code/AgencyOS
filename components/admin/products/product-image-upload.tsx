"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Image as ImageIcon, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove: () => void;
}

export function ProductImageUpload({ value, onChange, onRemove }: ProductImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [hasError, setHasError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi file (optional but good)
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        // Preview local
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setHasError(false);

        // Upload to R2 via API
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        try {
            const res = await fetch("/api/storage/media", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Upload failed");

            toast.success("Image uploaded to R2");
            onChange(data.url);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image to storage");
            setHasError(true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setHasError(false);
        onRemove();
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Image</label>
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-[9px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3 h-3" /> Remove
                    </button>
                )}
            </div>

            <div
                className={`relative group border border-dashed rounded-2xl overflow-hidden transition-all cursor-pointer shadow-2xl shadow-black/20
                    ${hasError
                        ? 'border-red-500/30 bg-red-900/10 hover:bg-red-900/20'
                        : preview
                            ? 'border-white/5 bg-zinc-900/40'
                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-brand-yellow/30'
                    }
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{ aspectRatio: '16/9' }}
                onClick={() => !isUploading && inputRef.current?.click()}
            >
                {preview && !hasError ? (
                    <>
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            unoptimized={true}
                            className="object-cover"
                            onError={() => setHasError(true)}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <Loader2 className="w-6 h-6 text-brand-yellow animate-spin" />
                            </div>
                        )}
                    </>
                ) : hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-3xl bg-red-500/10 flex items-center justify-center mb-3 border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-[11px] font-black text-red-400 uppercase tracking-tight">Upload Failed</p>
                        <p className="text-[9px] text-zinc-500 mt-1 mb-3 font-medium uppercase tracking-widest">Check Storage Settings</p>
                        <div className="px-3 py-1.5 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 border border-white/5 group-hover:border-white/10 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                            Click to retry
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-3xl bg-white/5 flex items-center justify-center mb-3 border border-white/5 group-hover:border-brand-yellow/20 transition-all">
                            <ImageIcon className="w-5 h-5 text-zinc-500 group-hover:text-brand-yellow transition-colors" />
                        </div>
                        <p className="text-[11px] font-black text-zinc-300 uppercase tracking-tight">Post visuals here</p>
                        <p className="text-[9px] text-zinc-600 mt-1 font-bold uppercase tracking-widest leading-none">Recommended for R2 storage</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>
            {isUploading && (
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-2.5 h-2.5 text-zinc-700 animate-spin" />
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest animate-pulse">Syncing to Cloudflare R2...</p>
                </div>
            )}
        </div>
    );
}
