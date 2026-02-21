"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileCode2, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Props untuk komponen HtmlFileUploader.
 * onFileLoad dipanggil ketika file berhasil dibaca, mengirimkan konten HTML.
 * currentHtml digunakan untuk menampilkan status apakah sudah ada konten.
 * compact: jika true, tampilkan mode compact (untuk dalam dialog).
 */
interface HtmlFileUploaderProps {
    onFileLoad: (content: string) => void;
    currentHtml: string;
    compact?: boolean;
}

/** Ekstensi file yang diizinkan untuk upload */
const ALLOWED_EXTENSIONS = [".html", ".htm"];
/** Batas ukuran file: 5 MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Format ukuran file ke string yang mudah dibaca.
 * Contoh: 1024 → "1.0 KB", 1048576 → "1.0 MB"
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Komponen upload untuk file HTML.
 * Mendukung klik untuk memilih file atau drag-and-drop.
 * Mode compact: 1-baris inline, cocok untuk dialog.
 * Mode normal: area drag-drop penuh dengan header/footer.
 */
export function HtmlFileUploader({ onFileLoad, currentHtml, compact = false }: HtmlFileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [loadedFile, setLoadedFile] = useState<{ name: string; size: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Validasi dan baca isi file HTML.
     * Mengecek ekstensi dan ukuran file sebelum membaca konten.
     */
    const processFile = useCallback((file: File) => {
        const fileName = file.name.toLowerCase();
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
        if (!hasValidExtension) {
            toast.error("Hanya file .html dan .htm yang diizinkan");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran file terlalu besar (maks 5MB)");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                onFileLoad(content);
                setLoadedFile({ name: file.name, size: file.size });
                toast.success(`File "${file.name}" berhasil dimuat`);
            }
        };
        reader.onerror = () => toast.error("Gagal membaca file");
        reader.readAsText(file);
    }, [onFileLoad]);

    // Drag & Drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) processFile(files[0]);
    }, [processFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) processFile(files[0]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [processFile]);

    const handleClear = useCallback(() => {
        setLoadedFile(null);
        onFileLoad("");
        toast.info("File dihapus");
    }, [onFileLoad]);

    // Hidden file input (shared)
    const hiddenInput = (
        <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileSelect}
            className="hidden"
        />
    );

    // === MODE COMPACT: 1-line inline upload ===
    if (compact) {
        if (loadedFile) {
            return (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <FileCode2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="text-xs text-white font-medium truncate">{loadedFile.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">{formatFileSize(loadedFile.size)}</span>
                    <button
                        onClick={handleClear}
                        className="ml-auto p-0.5 text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    {hiddenInput}
                </div>
            );
        }

        return (
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer transition-all ${isDragging
                        ? "border-brand-yellow bg-brand-yellow/5"
                        : "border-white/15 hover:border-white/25 hover:bg-white/[0.02]"
                    }`}
            >
                <Upload className={`w-3.5 h-3.5 shrink-0 ${isDragging ? "text-brand-yellow" : "text-zinc-500"}`} />
                <span className="text-xs text-zinc-400">
                    Drop file atau <span className="text-brand-yellow font-semibold">pilih .html</span>
                </span>
                <span className="text-[9px] text-zinc-600 font-mono ml-auto shrink-0">maks 5MB</span>
                {hiddenInput}
            </div>
        );
    }

    // === MODE NORMAL: Area drag-drop penuh ===
    return (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl flex flex-col min-h-[300px] md:min-h-[500px]">
            {/* Header Bar */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <div className="h-4 w-px bg-white/5 mx-2" />
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                        <Upload className="w-3 h-3 text-brand-yellow/60" /> File Upload
                    </span>
                </div>
            </div>

            {/* Area Utama: Drag & Drop Zone */}
            <div className="flex-1 flex items-center justify-center p-6">
                {loadedFile ? (
                    <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <FileCode2 className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white flex items-center gap-2 justify-center">
                                <FileCode2 className="w-4 h-4 text-brand-yellow" />
                                {loadedFile.name}
                            </p>
                            <p className="text-xs text-zinc-500 font-mono">
                                {formatFileSize(loadedFile.size)} • {(currentHtml || "").split('\n').length} baris
                            </p>
                        </div>
                        <button
                            onClick={handleClear}
                            className="text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5 px-3 py-1.5 rounded-md flex items-center"
                        >
                            <X className="w-3 h-3" /> Hapus File
                        </button>
                    </div>
                ) : (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            w-full h-full min-h-[250px] md:min-h-[400px] rounded-xl border-2 border-dashed cursor-pointer
                            flex flex-col items-center justify-center gap-4 transition-all duration-300
                            ${isDragging
                                ? "border-brand-yellow bg-brand-yellow/5 scale-[1.02]"
                                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                            }
                        `}
                    >
                        <div className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                            ${isDragging
                                ? "bg-brand-yellow/20 border-brand-yellow/30 scale-110"
                                : "bg-white/5 border border-white/10"
                            }
                        `}>
                            <Upload className={`w-7 h-7 transition-colors ${isDragging ? "text-brand-yellow" : "text-zinc-500"}`} />
                        </div>
                        <div className="text-center space-y-1.5">
                            <p className={`text-sm font-bold transition-colors ${isDragging ? "text-brand-yellow" : "text-zinc-300"}`}>
                                {isDragging ? "Lepaskan file di sini" : "Drag & drop file HTML"}
                            </p>
                            <p className="text-xs text-zinc-500">
                                atau <span className="text-brand-yellow font-semibold underline underline-offset-2">klik untuk pilih file</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                            Hanya .html / .htm • Maks 5MB
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Bar */}
            <div className="bg-[#111] px-4 py-1.5 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-4 text-[9px] font-mono">
                    <span className="flex items-center gap-1 text-zinc-500">
                        <div className="w-1 h-1 rounded-full bg-brand-yellow" /> Upload Mode
                    </span>
                    <span className="text-zinc-600">.html / .htm</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 tracking-tighter">
                    {loadedFile ? formatFileSize(loadedFile.size) : "No file loaded"}
                </div>
            </div>
            {hiddenInput}
        </div>
    );
}
