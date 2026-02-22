"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Trash2, Calendar, HardDrive } from "lucide-react";
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
    getFolderLabel: (folder: string) => string;
    selectedKeys: Set<string>;
    onToggleSelect: (key: string) => void;
    onSelectAll: () => void;
    isAllSelected: boolean;
}

export function MediaList({
    items, onCopy, onDelete, copiedUrl, formatSize, getFolderLabel,
    selectedKeys, onToggleSelect, onSelectAll, isAllSelected
}: MediaListProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
            <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-zinc-400 uppercase tracking-wider font-semibold">
                    <tr>
                        <th className="px-4 py-3 w-10">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={onSelectAll}
                                className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-violet-600 focus:ring-violet-500 ring-offset-zinc-950"
                            />
                        </th>
                        <th className="px-4 py-3">File Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Last Modified</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                        <tr key={item.key} className={`hover:bg-white/5 transition-colors group ${selectedKeys.has(item.key) ? 'bg-violet-500/5' : ''}`}>
                            <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedKeys.has(item.key)}
                                    onChange={() => onToggleSelect(item.key)}
                                    className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-violet-600 focus:ring-violet-500 ring-offset-zinc-950"
                                />
                            </td>
                            <td className="px-4 py-3 max-w-xs md:max-w-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                        {item.url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.key) ? (
                                            <Image src={item.url} alt="" fill className="object-cover" unoptimized sizes="32px" />
                                        ) : (
                                            <span className="text-[10px] text-zinc-600">FILE</span>
                                        )}
                                    </div>
                                    <span className="truncate text-zinc-300" title={item.key}>
                                        {item.key.split('/').pop()}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/5">
                                    {getFolderLabel(item.key.split('/')[0])}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 font-mono">
                                {item.size !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <HardDrive className="w-3 h-3" />
                                        {formatSize(item.size)}
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-3 text-zinc-500">
                                {item.lastModified && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(item.lastModified), "MMM d, yyyy")}
                                    </div>
                                )}
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
