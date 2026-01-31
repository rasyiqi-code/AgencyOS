import { prisma } from "@/lib/db";
import { ChangelogTable } from "@/components/admin/system/changelog/changelog-table";
import { AddChangelogDialog } from "@/components/admin/system/changelog/add-changelog-dialog";

export const dynamic = 'force-dynamic';

export default async function AdminChangelogPage() {
    const changelogs = await prisma.changelog.findMany({
        orderBy: { publishedAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Changelog
                    </h1>
                    <p className="text-zinc-400">
                        Manage platform updates and release notes.
                    </p>
                </div>
                <AddChangelogDialog />
            </div>

            <div className="grid gap-6">
                <ChangelogTable data={changelogs} />
            </div>
        </div>
    );
}
