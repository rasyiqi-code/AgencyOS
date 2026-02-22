"use client";

import { useEffect, useState, useMemo } from "react";
import { Upload, Loader2, Search, LayoutGrid, List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MediaGrid } from "./media-grid";
import { MediaList } from "./media-list";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/shared/utils";

interface MediaFile {
    key: string;
    size: number;
    lastModified: Date;
    url: string;
}

const SYSTEM_FOLDERS = ["objects"];

const FOLDER_LABELS: Record<string, string> = {
    "logos": "Logo & Branding",
    "marketing": "Materi Marketing",
    "products": "Gambar Produk",
    "projects": "Aset Proyek",
    "proofs": "Bukti Pembayaran",
    "services": "Gambar Layanan",
    "tickets": "Lampiran Tiket",
    "uploads": "Unggahan User",
};

function getFolderLabel(folderName: string): string {
    return FOLDER_LABELS[folderName.toLowerCase()] || folderName.charAt(0).toUpperCase() + folderName.slice(1);
}

export function MediaLibrary() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadFiles();
    }, []);

    // 1. Filter by search query first if present
    const searchedFiles = useMemo(() => {
        if (!searchQuery) return files;
        return files.filter(f => f.key.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [files, searchQuery]);

    // 2. Filter and process files
    const filteredItems = useMemo(() => {
        return searchedFiles.filter(file => {
            // Hide system folders/files entirely
            const topFolder = file.key.split('/')[0].toLowerCase();
            return !SYSTEM_FOLDERS.includes(topFolder);
        });
    }, [searchedFiles]);

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
                formData.append("folder", "media"); // Default folder

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

    const toggleSelection = (key: string) => {
        const newSelection = new Set(selectedKeys);
        if (newSelection.has(key)) {
            newSelection.delete(key);
        } else {
            newSelection.add(key);
        }
        setSelectedKeys(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedKeys.size === filteredItems.length) {
            setSelectedKeys(new Set());
        } else {
            setSelectedKeys(new Set(filteredItems.map(f => f.key)));
        }
    };

    async function handleBulkDelete() {
        if (selectedKeys.size === 0) return;
        if (!confirm(`Yakin ingin menghapus ${selectedKeys.size} file yang dipilih?`)) return;

        const keysToDelete = Array.from(selectedKeys);
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const key of keysToDelete) {
                const encodedKey = encodeURIComponent(key);
                const res = await fetch(`/api/storage/media/${encodedKey}`, {
                    method: "DELETE",
                });
                if (res.ok) successCount++;
                else failCount++;
            }

            if (successCount > 0) toast.success(`${successCount} file berhasil dihapus`);
            if (failCount > 0) toast.error(`${failCount} file gagal dihapus`);

            setSelectedKeys(new Set());
            await loadFiles();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Terjadi kesalahan saat penghapusan massal");
        } finally {
            setLoading(false);
        }
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }



    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 w-full md:max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Cari media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-900/40 border-white/5 pl-10 h-10 ring-offset-zinc-950 focus-visible:ring-violet-500/50"
                        />
                    </div>
                    <div className="flex items-center bg-zinc-900/40 border border-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewType("grid")}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                viewType === "grid" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewType("list")}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                viewType === "list" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedKeys.size > 0 && (
                        <div className="flex items-center gap-2 mr-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedKeys(new Set())}
                                className="h-10 border-white/5 bg-zinc-900/40 text-zinc-400 hover:text-white"
                            >
                                Batal ({selectedKeys.size})
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="h-10 px-4 font-semibold"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Terpilih
                            </Button>
                        </div>
                    )}
                    <label className="relative flex-1 md:flex-none">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                        <Button
                            asChild
                            disabled={uploading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white h-10 px-6 font-semibold"
                        >
                            <span>
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Media
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                        <p className="text-zinc-500 animate-pulse font-mono text-sm tracking-tighter">ESTABLISHING_DATA_LINK...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/5 bg-zinc-900/20">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-zinc-700" />
                        </div>
                        <h3 className="text-white font-semibold mb-1">No media found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs text-center">
                            {searchQuery ? `No results for "${searchQuery}"` : "Try uploading some files."}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="link"
                                onClick={() => setSearchQuery("")}
                                className="text-violet-400 mt-2"
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {viewType === "grid" ? (
                            <MediaGrid
                                files={filteredItems}
                                onCopy={copyToClipboard}
                                onDelete={handleDelete}
                                copiedUrl={copiedUrl}
                                formatSize={formatFileSize}
                                getFolderLabel={getFolderLabel}
                                selectedKeys={selectedKeys}
                                onToggleSelect={toggleSelection}
                            />
                        ) : (
                            <MediaList
                                items={filteredItems.map(f => ({ ...f, type: "file" as const }))}
                                onCopy={copyToClipboard}
                                onDelete={handleDelete}
                                onFolderClick={() => { }} // No folder click in flat list
                                copiedUrl={copiedUrl}
                                formatSize={formatFileSize}
                                getFolderLabel={getFolderLabel}
                                selectedKeys={selectedKeys}
                                onToggleSelect={toggleSelection}
                                onSelectAll={toggleSelectAll}
                                isAllSelected={selectedKeys.size === filteredItems.length && filteredItems.length > 0}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
