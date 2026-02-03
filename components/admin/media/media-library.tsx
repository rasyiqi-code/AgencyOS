"use client";

import { useEffect, useState } from "react";
import { Upload, Loader2, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface MediaFile {
    key: string;
    size: number;
    lastModified: Date;
    url: string;
}

export function MediaLibrary() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    useEffect(() => {
        loadFiles();
    }, []);

    async function loadFiles() {
        try {
            setLoading(true);
            const res = await fetch("/api/storage/media");
            const data = await res.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error("Failed to load media:", error);
            toast.error("Gagal memuat media");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        try {
            // Upload sequentially to avoid hitting Auth rate limits
            for (const file of Array.from(selectedFiles)) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "media");

                const res = await fetch("/api/storage/media", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    const errorMsg = errorData.details || errorData.error || `Failed to upload ${file.name}`;
                    toast.error(`Gagal upload ${file.name}: ${errorMsg}`);
                }
            }

            toast.success("Proses upload selesai");
            await loadFiles();
        } catch (error) {
            console.error("Upload error:", error);
            const errorMsg = error instanceof Error ? error.message : "Gagal mengupload file";
            toast.error(errorMsg);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(key: string) {
        if (!confirm("Yakin ingin menghapus file ini?")) return;

        try {
            const encodedKey = encodeURIComponent(key);
            const res = await fetch(`/api/storage/media/${encodedKey}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("File berhasil dihapus");
            await loadFiles();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Gagal menghapus file");
        }
    }

    function copyToClipboard(url: string) {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast.success("URL disalin ke clipboard");
        setTimeout(() => setCopiedUrl(null), 2000);
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function isImage(key: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Upload Gambar</h3>
                </div>

                <label className="relative block">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors cursor-pointer">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                                <p className="text-sm text-zinc-400">Mengupload...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-zinc-600" />
                                <p className="text-sm text-zinc-400">
                                    Klik atau drag & drop untuk upload gambar
                                </p>
                                <p className="text-xs text-zinc-600">
                                    Mendukung: JPG, PNG, GIF, WebP, SVG
                                </p>
                            </div>
                        )}
                    </div>
                </label>
            </div>

            {/* Media Grid */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">
                    Media Files ({files.length})
                </h3>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        Belum ada media yang diupload
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {files.map((file) => (
                            <div
                                key={file.key}
                                className="group relative rounded-lg border border-white/5 bg-black/20 overflow-hidden hover:border-white/10 transition-all"
                            >
                                {/* Image Preview */}
                                <div className="aspect-square relative bg-zinc-900">
                                    {isImage(file.key) ? (
                                        <Image
                                            src={file.url}
                                            alt={file.key}
                                            fill
                                            unoptimized={true}
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full">
                                            <span className="text-zinc-600 text-xs">File</span>
                                        </div>
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="p-3 space-y-2">
                                    <p className="text-xs text-zinc-400 truncate" title={file.key}>
                                        {file.key.split('/').pop()}
                                    </p>
                                    <p className="text-[10px] text-zinc-600">
                                        {formatFileSize(file.size)}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(file.url)}
                                            className="h-7 text-xs flex-1"
                                        >
                                            {copiedUrl === file.url ? (
                                                <Check className="w-3 h-3" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(file.key)}
                                            className="h-7 text-xs text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
