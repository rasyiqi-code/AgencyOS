"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Trash2, Calendar, HardDrive, Folder } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface MediaItem {
    key: string;
    size?: number;
    lastModified?: Date;
    url?: string;
    type: "file" | "folder";
}

interface MediaListProps {
    items: MediaItem[];
    onCopy: (url: string) => void;
    onDelete: (key: string) => void;
    onFolderClick: (name: string) => void;
    copiedUrl: string | null;
    formatSize: (bytes: number) => string;
}

export function MediaList({ items, onCopy, onDelete, onFolderClick, copiedUrl, formatSize }: MediaListProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
            <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-zinc-400 uppercase tracking-wider font-semibold">
                    <tr>
                        <th className="px-4 py-3">File Name</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Last Modified</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                        <tr key={item.key} className="hover:bg-white/5 transition-colors group">
                            <td className="px-4 py-3 max-w-xs md:max-w-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                        {item.type === "folder" ? (
                                            <Folder className="w-4 h-4 text-violet-400" />
                                        ) : item.url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.key) ? (
                                            <Image src={item.url} alt="" fill className="object-cover" unoptimized sizes="32px" />
                                        ) : (
                                            <span className="text-[10px] text-zinc-600">FILE</span>
                                        )}
                                    </div>
                                    {item.type === "folder" ? (
                                        <button
                                            onClick={() => onFolderClick(item.key)}
                                            className="truncate text-zinc-300 hover:text-violet-400 font-medium transition-colors"
                                        >
                                            {item.key}
                                        </button>
                                    ) : (
                                        <span className="truncate text-zinc-300" title={item.key}>
                                            {item.key.split('/').pop()}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 font-mono">
                                {item.type === "file" && item.size !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <HardDrive className="w-3 h-3" />
                                        {formatSize(item.size)}
                                    </div>
                                )}
                                {item.type === "folder" && "-"}
                            </td>
                            <td className="px-4 py-3 text-zinc-500">
                                {item.type === "file" && item.lastModified && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(item.lastModified), "MMM d, yyyy")}
                                    </div>
                                )}
                                {item.type === "folder" && "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                                {item.type === "file" && item.url && (
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onCopy(item.url!)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {copiedUrl === item.url ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDelete(item.key)}
                                            className="h-8 w-8 p-0 text-red-500/70 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
