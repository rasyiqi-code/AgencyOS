"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Check, Trash2 } from "lucide-react";

interface MediaFile {
    key: string;
    size: number;
    lastModified: Date;
    url: string;
}

interface MediaGridProps {
    files: MediaFile[];
    onCopy: (url: string) => void;
    onDelete: (key: string) => void;
    copiedUrl: string | null;
    formatSize: (bytes: number) => string;
    getFolderLabel: (folder: string) => string;
    selectedKeys: Set<string>;
    onToggleSelect: (key: string) => void;
}

export function MediaGrid({ files, onCopy, onDelete, copiedUrl, formatSize, getFolderLabel, selectedKeys, onToggleSelect }: MediaGridProps) {
    function isImage(key: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {files.map((file) => (
                <div
                    key={file.key}
                    onClick={() => onToggleSelect(file.key)}
                    className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${selectedKeys.has(file.key)
                            ? 'border-violet-500 bg-violet-500/5 ring-2 ring-violet-500/20'
                            : 'border-white/5 bg-black/20 hover:border-white/10'
                        }`}
                >
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity data-[selected=true]:opacity-100" data-selected={selectedKeys.has(file.key)}>
                        <input
                            type="checkbox"
                            checked={selectedKeys.has(file.key)}
                            readOnly
                            className="w-4 h-4 rounded border-white/20 bg-black/50 text-violet-600 focus:ring-violet-500 ring-offset-zinc-950 shadow-lg"
                        />
                    </div>
                    <div className="aspect-square relative bg-zinc-900">
                        {isImage(file.key) ? (
                            <Image
                                src={file.url}
                                alt={file.key}
                                fill
                                unoptimized={true}
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <span className="text-zinc-600 text-xs">File</span>
                            </div>
                        )}
                    </div>

                    <div className="p-3 space-y-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20 w-fit">
                                {getFolderLabel(file.key.split('/')[0])}
                            </span>
                            <p className="text-xs text-zinc-300 truncate font-medium" title={file.key}>
                                {file.key.split('/').pop()}
                            </p>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-medium">
                            {formatSize(file.size)}
                        </p>

                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); onCopy(file.url); }}
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
                                onClick={(e) => { e.stopPropagation(); onDelete(file.key); }}
                                className="h-7 text-xs text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
