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
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Product Image</label>
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3 h-3" /> Remove
                    </button>
                )}
            </div>

            <div
                className={`relative group border border-dashed rounded-lg overflow-hidden transition-all cursor-pointer
                    ${hasError
                        ? 'border-red-500/30 bg-red-900/10 hover:bg-red-900/20'
                        : preview
                            ? 'border-zinc-700 bg-black/40'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
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
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </>
                ) : hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-red-400">Upload Failed</p>
                        <p className="text-xs text-zinc-500 mt-1 mb-3">Check Storage Settings</p>
                        <div className="px-3 py-1.5 rounded-full bg-white/5 text-[10px] text-zinc-300 flex items-center gap-2 border border-white/5 group-hover:border-white/20 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                            Click to retry
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">Click to upload product image</p>
                        <p className="text-xs text-zinc-500 mt-1">Recommended for R2 storage</p>
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
            {isUploading && <p className="text-[10px] text-zinc-500 text-center animate-pulse">Uploading to Cloudflare R2...</p>}
        </div>
    );
}
