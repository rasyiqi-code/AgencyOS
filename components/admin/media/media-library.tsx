"use client";

import { useEffect, useState, useMemo } from "react";
import { Upload, Loader2, Search, LayoutGrid, List, ChevronRight, Folder, Home } from "lucide-react";
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

export function MediaLibrary() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [currentPath, setCurrentPath] = useState(""); // Folder path (virtual)

    useEffect(() => {
        loadFiles();
    }, []);

    // 1. Filter by search query first if present
    const searchedFiles = useMemo(() => {
        if (!searchQuery) return files;
        return files.filter(f => f.key.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [files, searchQuery]);

    // 2. Determine folders and files in current path
    const { items, subFolders } = useMemo(() => {
        const folderSet = new Set<string>();
        const fileItems: MediaFile[] = [];

        searchedFiles.forEach(file => {
            const relativePath = currentPath ? file.key.slice(currentPath.length + 1) : file.key;
            if (!relativePath) return;

            const parts = relativePath.split('/');
            if (parts.length > 1) {
                // It's a folder
                folderSet.add(parts[0]);
            } else if (!searchQuery || parts[0].toLowerCase().includes(searchQuery.toLowerCase())) {
                // It's a file in this folder (or matching search if searching globally)
                // Note: when searching, we usually want to show matching files even if they are deep
                // but for simple navigation, we show them only if they are in current folder.
                // If searching, let's show all matching files regardless of path? 
                // Let's stick to current folder unless searching.
                if (searchQuery || file.key.startsWith(currentPath)) {
                    // if searching, we might ignore folder structure for a moment to find the file
                    fileItems.push(file);
                }
            }
        });

        // Special case: If searching, show all matching files, don't show folders
        if (searchQuery) {
            return { items: searchedFiles, subFolders: [] as string[] };
        }

        return {
            items: fileItems.filter(f => {
                const parts = (currentPath ? f.key.slice(currentPath.length + 1) : f.key).split('/');
                return parts.length === 1;
            }),
            subFolders: Array.from(folderSet).sort()
        };
    }, [searchedFiles, currentPath, searchQuery]);

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
                // Use currentPath as folder prefix if available
                formData.append("folder", currentPath || "media");

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

            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => { setCurrentPath(""); setSearchQuery(""); }}
                    className="flex items-center gap-1.5 hover:text-white transition-colors flex-shrink-0"
                >
                    <Home className="w-4 h-4" />
                    Board
                </button>
                {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <button
                            onClick={() => {
                                const newPath = arr.slice(0, i + 1).join('/');
                                setCurrentPath(newPath);
                            }}
                            className="hover:text-white transition-colors capitalize"
                        >
                            {part}
                        </button>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                        <p className="text-zinc-500 animate-pulse font-mono text-sm tracking-tighter">ESTABLISHING_DATA_LINK...</p>
                    </div>
                ) : items.length === 0 && subFolders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/5 bg-zinc-900/20">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-zinc-700" />
                        </div>
                        <h3 className="text-white font-semibold mb-1">No media found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs text-center">
                            {searchQuery ? `No results for "${searchQuery}"` : "Try uploading some files or check another folder."}
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
                            <>
                                {/* Grid Folders (Only if not searching) */}
                                {!searchQuery && subFolders.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                                        {subFolders.map(folder => (
                                            <button
                                                key={folder}
                                                onClick={() => setCurrentPath(currentPath ? `${currentPath}/${folder}` : folder)}
                                                className="group flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-violet-500/30 transition-all text-left"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Folder className="w-5 h-5 text-violet-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-zinc-300 truncate w-24 group-hover:text-white transition-colors">
                                                        {folder}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Grid Files */}
                                {items.length > 0 && (
                                    <MediaGrid
                                        files={items}
                                        onCopy={copyToClipboard}
                                        onDelete={handleDelete}
                                        copiedUrl={copiedUrl}
                                        formatSize={formatFileSize}
                                    />
                                )}
                            </>
                        ) : (
                            <MediaList
                                items={[
                                    ...subFolders.map(f => ({ key: f, type: "folder" as const })),
                                    ...items.map(f => ({ ...f, type: "file" as const }))
                                ]}
                                onCopy={copyToClipboard}
                                onDelete={handleDelete}
                                onFolderClick={(name) => setCurrentPath(currentPath ? `${currentPath}/${name}` : name)}
                                copiedUrl={copiedUrl}
                                formatSize={formatFileSize}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
