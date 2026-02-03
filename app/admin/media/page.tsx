import { Images } from "lucide-react";
import { MediaLibrary } from "@/components/admin/media/media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Content Management</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Media Library
                        <Images className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Kelola dan upload gambar untuk digunakan di website Anda.
                    </p>
                </div>
            </div>

            <MediaLibrary />
        </div>
    );
}
