"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FileItem {
    key: string;
    url: string;
    size: number;
    lastModified: string;
}

export function MediaLibraryPicker({ onSelect, prefix = "services/" }: { onSelect: (url: string) => void, prefix?: string }) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/storage/media?prefix=${prefix}`);
            const data = await res.json();
            if (data.files) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error("Failed to fetch media files:", error);
        } finally {
            setIsLoading(false);
        }
    }, [prefix]);

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen, fetchFiles]);

    const filteredFiles = files.filter(file =>
        file.key.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors outline-none focus:text-brand-yellow"
                >
                    <ImageIcon className="w-3 h-3" />
                    Library
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                        <ImageIcon className="w-5 h-5 text-brand-yellow" />
                        Media Library / {prefix}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search images..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 text-zinc-200 focus:ring-brand-yellow/20 rounded-xl"
                    />
                </div>

                {isLoading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Syncing Library...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-zinc-500">
                        <ImageIcon className="w-12 h-12 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No images found</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4 scrollbar-custom">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                            {filteredFiles.map((file) => (
                                <button
                                    key={file.key}
                                    type="button"
                                    onClick={() => {
                                        onSelect(file.url);
                                        setIsOpen(false);
                                    }}
                                    className="group relative aspect-video rounded-xl border border-white/5 bg-black/40 overflow-hidden hover:border-brand-yellow/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                                >
                                    <Image
                                        src={file.url}
                                        alt={file.key}
                                        fill
                                        unoptimized={true}
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black px-3 py-1 bg-brand-yellow rounded-full shadow-lg">Select</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-[9px] font-bold text-zinc-300 truncate text-left">{file.key.split('/').pop()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
