import { Images } from "lucide-react";
import { MediaLibrary } from "@/components/admin/media/media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
    return (
        <div className="w-full py-4 sm:py-6 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Content Management</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2 sm:gap-3">
                        Media Library
                        <Images className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-1.5 sm:mt-2 text-xs sm:text-sm max-w-lg">
                        Kelola dan upload gambar untuk digunakan di website Anda.
                    </p>
                </div>
            </div>

            <MediaLibrary />
        </div>
    );
}
