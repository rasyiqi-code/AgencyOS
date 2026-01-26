
export interface GitHubRepo {
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    updated_at: string;
    language: string;
}

export interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    html_url: string;
}

const GITHUB_API_BASE = "https://api.github.com";

export async function getRepoDetails(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
        const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error fetching repo details:", error);
        return null;
    }
}

export async function getRecentCommits(owner: string, repo: string, limit = 5): Promise<GitHubCommit[]> {
    try {
        const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${limit}`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 60 }
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Error fetching commits:", error);
        return [];
    }
}
