import { MediaLibrary } from "@/components/admin/media/media-library";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
    return (
        <div className="w-full py-4 sm:py-6 min-w-0">
            <AdminHeaderSetter title="Media Library" />

            <MediaLibrary />
        </div>
    );
}
