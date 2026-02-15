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
}

export function MediaGrid({ files, onCopy, onDelete, copiedUrl, formatSize }: MediaGridProps) {
    function isImage(key: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {files.map((file) => (
                <div
                    key={file.key}
                    className="group relative rounded-lg border border-white/5 bg-black/20 overflow-hidden hover:border-white/10 transition-all"
                >
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
                        <p className="text-xs text-zinc-400 truncate" title={file.key}>
                            {file.key.split('/').pop()}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                            {formatSize(file.size)}
                        </p>

                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onCopy(file.url)}
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
                                onClick={() => onDelete(file.key)}
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
