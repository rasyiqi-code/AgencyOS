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
        <div className="w-full max-w-full overflow-hidden">
            <div className="rounded-xl border border-zinc-800/50 bg-[#09090b] relative overflow-hidden">
                <div className="overflow-x-auto w-full 
                    [&::-webkit-scrollbar]:h-1.5 
                    [&::-webkit-scrollbar-track]:bg-transparent 
                    [&::-webkit-scrollbar-thumb]:bg-zinc-800/50 
                    [&::-webkit-scrollbar-thumb]:rounded-full 
                    hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700/80
                    transition-colors"
                >
                    <table className="border-separate border-spacing-0 table-fixed w-full min-w-[1000px] text-sm">
                        <thead>
                            <tr className="bg-zinc-950">
                                <th style={{ width: 48 }} className="h-10 px-4 text-center align-middle font-bold text-zinc-400 border-b border-zinc-800 border-r border-zinc-800/50 sticky top-0 z-40 uppercase text-[10px] tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={onSelectAll}
                                        className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-violet-600 focus:ring-violet-500 ring-offset-zinc-950"
                                    />
                                </th>
                                <th style={{ width: 400 }} className="h-10 px-4 text-left align-middle font-bold text-zinc-400 border-b border-zinc-800 border-r border-zinc-800/50 sticky top-0 z-40 uppercase text-[10px] tracking-wider">File Name</th>
                                <th style={{ width: 160 }} className="h-10 px-4 text-left align-middle font-bold text-zinc-400 border-b border-zinc-800 border-r border-zinc-800/50 sticky top-0 z-40 uppercase text-[10px] tracking-wider">Category</th>
                                <th style={{ width: 120 }} className="h-10 px-4 text-left align-middle font-bold text-zinc-400 border-b border-zinc-800 border-r border-zinc-800/50 sticky top-0 z-40 uppercase text-[10px] tracking-wider">Size</th>
                                <th style={{ width: 150 }} className="h-10 px-4 text-left align-middle font-bold text-zinc-400 border-b border-zinc-800 border-r border-zinc-800/50 sticky top-0 z-40 uppercase text-[10px] tracking-wider">Last Modified</th>
                                <th style={{ width: 122 }} className="h-10 px-4 text-center align-middle font-bold text-zinc-400 border-b border-zinc-800 sticky top-0 z-40 uppercase text-[10px] tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {items.map((item) => (
                                <tr key={item.key} className="group transition-colors hover:bg-zinc-900/30">
                                    <td className="h-12 px-4 align-middle border-b border-zinc-800/50 text-center border-r border-zinc-800/50">
                                        <input
                                            type="checkbox"
                                            checked={selectedKeys.has(item.key)}
                                            onChange={() => onToggleSelect(item.key)}
                                            className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-violet-600 focus:ring-violet-500 ring-offset-zinc-950"
                                        />
                                    </td>
                                    <td className="h-12 px-4 align-middle border-b border-zinc-800/50 border-r border-zinc-800/50 overflow-hidden">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-sm">
                                                {item.url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.key) ? (
                                                    <Image src={item.url} alt="" fill className="object-cover" unoptimized sizes="32px" />
                                                ) : (
                                                    <span className="text-[10px] text-zinc-600 font-bold">FILE</span>
                                                )}
                                            </div>
                                            <span className="truncate text-zinc-300 font-medium whitespace-nowrap" title={item.key}>
                                                {item.key.split('/').pop()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="h-12 px-4 align-middle border-b border-zinc-800/50 border-r border-zinc-800/50 overflow-hidden">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-zinc-950 text-zinc-400 border border-zinc-800 truncate max-w-full">
                                            {getFolderLabel(item.key.split('/')[0])}
                                        </span>
                                    </td>
                                    <td className="h-12 px-4 align-middle border-b border-zinc-800/50 border-r border-zinc-800/50 text-zinc-500 font-mono text-xs overflow-hidden">
                                        {item.size !== undefined && (
                                            <div className="flex items-center gap-1.5 truncate">
                                                <HardDrive className="w-3.5 h-3.5 opacity-50 shrink-0" />
                                                <span className="truncate">{formatSize(item.size)}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="h-12 px-4 align-middle border-b border-zinc-800/50 border-r border-zinc-800/50 text-zinc-500 text-xs overflow-hidden">
                                        {item.lastModified && (
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Calendar className="w-3.5 h-3.5 opacity-50 shrink-0" />
                                                <span className="truncate">{format(new Date(item.lastModified), "MMM d, yyyy")}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="h-12 px-4 align-middle border-b border-zinc-800/50 overflow-hidden">
                                        {item.type === "file" && item.url && (
                                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onCopy(item.url!)}
                                                    className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400 hover:text-white"
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
                                                    className="h-8 w-8 p-0 text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
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
            </div>
            {/* Indikator scroll untuk mobile */}
            <div className="md:hidden mt-3 flex justify-center">
                <div className="px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-500 flex items-center gap-2 uppercase tracking-widest font-bold animate-pulse">
                    <span>Swipe to view more</span>
                    <div className="w-4 h-px bg-zinc-700" />
                </div>
            </div>
        </div>
    );
}
