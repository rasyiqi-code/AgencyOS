"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, Download, Paperclip } from "lucide-react";
// import { uploadProjectFile } from "@/app/actions/project";
import { toast } from "sonner";
import Link from "next/link";

interface ProjectFile {
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
}

export function ProjectAssets({ projectId, initialFiles }: { projectId: string, initialFiles: ProjectFile[] | null | undefined }) {
    const [isUploading, setIsUploading] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);

        try {
            const res = await fetch(`/api/projects/${projectId}/files`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to upload");

            // Allow time for revalidation or handle state update locally if needed
            // router.refresh(); // In client component, we might rely on parent or just toast for now
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    }

    const files = (initialFiles as ProjectFile[]) || [];

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Paperclip className="w-4 h-4" />
                    <h2 className="text-base font-semibold tracking-tight text-white">Mission Assets</h2>
                </div>
                <div>
                    <input
                        type="file"
                        id="asset-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        onClick={() => document.getElementById('asset-upload')?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                        Upload File
                    </Button>
                </div>
            </div>

            {files.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-lg">
                    <p className="text-xs text-zinc-500">No assets uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="min-w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-medium text-zinc-200 truncate max-w-[120px]">{file.name}</p>
                                    <p className="text-[10px] text-zinc-500">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Link href={file.url} target="_blank">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white">
                                    <Download className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
