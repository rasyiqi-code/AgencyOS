import { getRecentCommits } from "@/lib/github";
import { GitCommit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RepoActivityProps {
    owner: string;
    repo: string;
}

export async function RepoActivity({ owner, repo }: RepoActivityProps) {
    const commits = await getRecentCommits(owner, repo);

    if (commits.length === 0) {
        return (
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <GitCommit className="w-4 h-4" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-zinc-500 text-sm">No recent commits or access denied.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900/50 border-white/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GitCommit className="w-4 h-4" />
                        Recent Activity
                    </div>
                    <Link
                        href={`https://github.com/${owner}/${repo}`}
                        target="_blank"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        View Repo <ExternalLink className="w-3 h-3" />
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {commits.map((commit) => (
                    <div key={commit.sha} className="flex gap-3 items-start group">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-blue-500 transition-colors" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300 truncate group-hover:text-white transition-colors">
                                {commit.commit.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                <span className="font-medium text-zinc-400">{commit.commit.author.name}</span>
                                <span>•</span>
                                <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
