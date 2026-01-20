"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const title = formData.get("title");
        const description = formData.get("description");

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create project");
            }

            // Refresh router to update server components cache on dashboard
            router.refresh();
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                        ← Back
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Start New Project</h1>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="title"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Project Title
                        </label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. E-commerce Mobile App"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Brief Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe your project requirements here..."
                            className="resize-none min-h-[150px]"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full sm:w-auto self-end" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Brief"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
