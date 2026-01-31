"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface Changelog {
    id: string
    title: string
    content: string
    version: string | null
    status: string
    publishedAt: Date
    authorName: string | null
}

export function ChangelogTable({ data }: { data: Changelog[] }) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/changelog?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete");
            }

            toast.success("Changelog deleted")
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete")
        }
    }

    return (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="w-[100px]">Version</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                No changelogs found. Create one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((log) => (
                            <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableCell>
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {log.version || 'v1.0'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                    {log.title}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={log.status === 'published' ? 'default' : 'secondary'} className={log.status === 'published' ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
                                        {log.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-400">
                                    {format(new Date(log.publishedAt), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer" onClick={() => handleDelete(log.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
