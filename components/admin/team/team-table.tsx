"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TeamMember {
    id: string
    email: string
    displayName: string
    profileImageUrl?: string | null
    isPm: boolean
    isFinance: boolean
    isDeveloper: boolean
}

interface TeamTableProps {
    data: TeamMember[]
    currentUserId?: string
}

export function TeamTable({ data, currentUserId }: TeamTableProps) {
    const [search, setSearch] = useState("")
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null) // '{userId}-{role}'

    const filteredData = data.filter(user =>
        user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    )

    const handleToggle = async (userId: string, email: string, role: string, currentValue: boolean) => {
        const loadingKey = `${userId}-${role}`
        setLoading(loadingKey)

        try {
            const response = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    email,
                    key: role,
                    action: currentValue ? 'revoke' : 'grant'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update permission");
            }

            toast.success(`Role ${role} ${currentValue ? 'revoked for' : 'granted to'} ${email}`)
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update permission")
            console.error(error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-zinc-500" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                />
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead className="text-center w-[150px]">Project Manager</TableHead>
                            <TableHead className="text-center w-[150px]">Finance</TableHead>
                            <TableHead className="text-center w-[150px]">Developer</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((user) => (
                            <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.profileImageUrl || ''} />
                                            <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{user.displayName}</span>
                                            <span className="text-xs text-zinc-500">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <Switch
                                            checked={user.isPm}
                                            disabled={loading === `${user.id}-manage_projects` || user.id === currentUserId}
                                            onCheckedChange={() => handleToggle(user.id, user.email, 'manage_projects', user.isPm)}
                                            className="data-[state=checked]:bg-indigo-600"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <Switch
                                            checked={user.isFinance}
                                            disabled={loading === `${user.id}-manage_billing` || user.id === currentUserId}
                                            onCheckedChange={() => handleToggle(user.id, user.email, 'manage_billing', user.isFinance)}
                                            className="data-[state=checked]:bg-emerald-600"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <Switch
                                            checked={user.isDeveloper}
                                            disabled={loading === `${user.id}-developer` || user.id === currentUserId}
                                            onCheckedChange={() => handleToggle(user.id, user.email, 'developer', user.isDeveloper)}
                                            className="data-[state=checked]:bg-amber-500"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Placeholder for future actions like Delete */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
                * Toggling a role saves immediately. Ensure you grant roles to trusted users only.
            </p>
        </div>
    )
}
