"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddChangelogDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Form State
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [version, setVersion] = useState("v1.0.0")
    const [status, setStatus] = useState("published")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/admin/changelog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    version,
                    status
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create changelog");
            }

            toast.success("Changelog created successfully")
            setOpen(false)
            // Reset form
            setTitle("")
            setContent("")
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create changelog")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-zinc-200">
                    <Plus className="w-4 h-4 mr-2" />
                    New Update
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Post New Update</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Share what&apos;s new with your users. Supports Markdown.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="version" className="text-right">
                            Version
                        </Label>
                        <Input
                            id="version"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="col-span-3 bg-zinc-900 border-zinc-800"
                            placeholder="v1.0.0"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3 bg-zinc-900 border-zinc-800"
                            placeholder="e.g. Added Dark Mode"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="content" className="text-right pt-2">
                            Content
                        </Label>
                        <div className="col-span-3">
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 min-h-[150px] font-mono text-sm"
                                placeholder="# Features\n- Added dark mode\n- Fixed login bug"
                                required
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                                Markdown is supported.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-brand-yellow text-black hover:bg-brand-yellow/90">
                            {loading ? "Posting..." : "Post Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
