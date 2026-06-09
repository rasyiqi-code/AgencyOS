import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { uploadProjectPreviewFn, updateProjectFn } from "@/src/server/pm";

interface PreviewUploaderProps {
    projectId: string;
    currentPreviewUrl: string | null;
}

export function PreviewUploader({ projectId, currentPreviewUrl }: PreviewUploaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("file", file);

        try {
            const result = await uploadProjectPreviewFn({ data: formData });
            if (!result.success) throw new Error("Gagal mengunggah pratinjau");

            toast.success("Pratinjau proyek berhasil diperbarui");
            router.invalidate();
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengunggah pratinjau");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        setIsLoading(true);
        try {
            const result = await updateProjectFn({
                data: {
                    projectId,
                    body: { previewUrl: null }
                }
            });
            if (!result.success) throw new Error("Failed to remove preview");

            toast.success("Pratinjau proyek berhasil dihapus");
            router.invalidate();
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus pratinjau");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Project Preview
                </h4>
                {currentPreviewUrl && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={isLoading}
                        className="h-6 text-[10px] text-zinc-500 hover:text-red-400"
                    >
                        <X className="w-2.5 h-2.5 mr-1" />
                        Remove
                    </Button>
                )}
            </div>

            {currentPreviewUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/20 group">
                    <img
                        src={currentPreviewUrl}
                        alt="Project Preview"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                name="preview-replace"
                                className="hidden"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={isLoading}
                            />
                            <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 transition-all">
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Change Image
                            </div>
                        </label>
                    </div>
                </div>
            ) : (
                <label className="block">
                    <input
                        type="file"
                        name="preview-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isLoading}
                    />
                    <div className="aspect-video rounded-xl border border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-blue-400 group">
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <ImagePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] font-medium uppercase tracking-tight">Upload Preview Screenshot</span>
                    </div>
                </label>
            )}
        </div>
    );
}
