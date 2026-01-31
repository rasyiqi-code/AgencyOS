
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Upload,
    Loader2,
    Download,
    Trash2,
    File,
    Paperclip,
    Eye
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { type ProjectFile } from "@/lib/types";

interface FileManagerProps {
    projectId: string;
    files: ProjectFile[];
}

export function FileManager({ projectId, files }: FileManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/projects/${projectId}/files`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            toast.success("File uploaded successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (fileUrl: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        setIsLoading(true);
        try {
            // We need a DELETE endpoint, but for now we can use a PATCH to projects
            // Or implement a quick DELETE endpoint. 
            // Let's assume we update via PATCH projects for now if DELETE is not ready.
            const updatedFiles = files.filter(f => f.url !== fileUrl);

            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files: updatedFiles }),
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.success("File deleted");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete file");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Project Documents</h4>
                </div>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={isLoading}
                    />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-tight transition-all border border-blue-500/20">
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Upload Document
                    </div>
                </label>
            </div>

            <div className="grid gap-2">
                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-white/5 bg-black/20 text-zinc-500">
                        <File className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-[10px] uppercase tracking-wider font-medium">No documents attached yet</p>
                    </div>
                ) : (
                    files.map((file, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-3 rounded-xl border border-white/5 bg-zinc-900/60 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-blue-400 transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-mono">
                                        {new Date(file.uploadedAt).toLocaleDateString()} • {(file.type || 'unknown').split('/')[1] || file.type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPreviewFile(file)}
                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-3.5 h-3.5" />
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(file.url)}
                                    disabled={isLoading}
                                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="max-w-4xl h-[80vh] bg-zinc-950 border-white/10 p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-4 border-b border-white/5 shrink-0">
                        <DialogTitle className="text-sm font-medium text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            {previewFile?.name}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Preview of the project document {previewFile?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative flex-1 bg-black/40 overflow-auto flex items-center justify-center p-4">
                        {previewFile?.type.startsWith('image/') ? (
                            <Image
                                src={previewFile.url}
                                alt={previewFile.name}
                                fill
                                className="object-contain p-4"
                                sizes="80vw"
                            />
                        ) : (
                            <iframe
                                src={previewFile?.url}
                                className="w-full h-full rounded-lg bg-white"
                                title={previewFile?.name}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
