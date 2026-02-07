
import { SafeImage } from "@/components/ui/safe-image";
import { Eye } from "lucide-react";

interface ProjectPreviewProps {
    url: string | null;
}

export function ProjectPreview({ url }: ProjectPreviewProps) {
    if (!url) return null;

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Project Preview
                </h4>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/20 group">
                <SafeImage
                    src={url}
                    alt="Project Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                />
            </div>
        </div>
    );
}
