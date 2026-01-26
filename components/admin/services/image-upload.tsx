"use client";

import { useState, useRef } from "react";
import { X, Image as ImageIcon, AlertCircle, RefreshCw } from "lucide-react";

export function ServiceImageUpload({ defaultValue }: { defaultValue?: string | null }) {
    const [preview, setPreview] = useState<string | null>(defaultValue || null);
    const [hasError, setHasError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setHasError(false); // Reset error state on new file
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering upload click
        setPreview(null);
        setHasError(false);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Cover Image</label>
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
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
                `}
                style={{ aspectRatio: '16/9' }}
                onClick={() => inputRef.current?.click()}
            >
                {preview && !hasError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setHasError(true)}
                    />
                ) : hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-red-400">Image Failed to Load</p>
                        <p className="text-xs text-zinc-500 mt-1 mb-3">Check Storage Settings</p>
                        <div className="px-3 py-1.5 rounded-full bg-white/5 text-[10px] text-zinc-300 flex items-center gap-2 border border-white/5 group-hover:border-white/20 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                            Click to replace
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">Click to upload image</p>
                        <p className="text-xs text-zinc-500 mt-1">1600x900 recommended</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
