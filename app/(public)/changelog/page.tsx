import { getChangelogs } from "@/lib/server/changelog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Metadata } from "next";
import ReactMarkdown from 'react-markdown';
import { Changelog } from "@prisma/client";

export const metadata: Metadata = {
    title: "Changelog - AgencyOS",
    description: "Latest updates, improvements, and fixes.",
};

export const dynamic = 'force-dynamic';

export default async function ChangelogPage() {
    const changelogs: Changelog[] = await getChangelogs(true);

    return (
        <div className="container max-w-3xl mx-auto py-16 px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Platform Updates</h1>
            <p className="text-zinc-400 mb-12">Latest changelog and improvements.</p>

            <div className="space-y-12">
                {changelogs.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">
                        No updates posted yet.
                    </div>
                ) : (
                    changelogs.map((log) => (
                        <div key={log.id} className="relative pl-8 border-l border-zinc-800 pb-12 last:pb-0">
                            <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-brand-yellow ring-4 ring-black" />

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold">{log.title}</h2>
                                        {log.version && (
                                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                {log.version}
                                            </Badge>
                                        )}
                                    </div>
                                    <time className="text-sm text-zinc-500 font-mono">
                                        {format(new Date(log.publishedAt), 'MMMM d, yyyy')}
                                    </time>
                                </div>

                                <div className="prose prose-invert prose-zinc max-w-none">
                                    <ReactMarkdown>{log.content}</ReactMarkdown>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    {/* Optional: Author avatar if available, for now just name */}
                                    <span className="text-xs text-zinc-600">
                                        Posted by {log.authorName || 'Team'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
