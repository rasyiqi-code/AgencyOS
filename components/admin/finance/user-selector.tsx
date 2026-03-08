"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/shared/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface User {
    id: string
    name: string
    email?: string
}

interface UserSelectorProps {
    users: User[]
    defaultValue?: string
    onValueChange?: (value: string) => void
}

export function UserSelector({ users, defaultValue = "", onValueChange }: UserSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue)
    const [searchQuery, setSearchQuery] = React.useState("")

    const handleSelect = (newValue: string) => {
        setValue(newValue)
        setOpen(false)
        setSearchQuery("")
        onValueChange?.(newValue)
    }

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative w-full">
            <input type="hidden" name="userId" value={value} required />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-transparent hover:bg-transparent border-0 text-white hover:text-white h-8 px-4 font-normal overflow-hidden shadow-none"
                    >
                        <span className="truncate">
                            {value
                                ? users.find((user) => user.id === value)?.name
                                : <span className="text-zinc-500">Pilih User Akun Klien...</span>}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-zinc-500 group-focus-within:text-brand-yellow transition-colors" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 border-zinc-800 bg-zinc-950"
                    align="start"
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                >
                    <div className="flex items-center border-b border-zinc-800 px-3 py-1">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400" />
                        <Input
                            placeholder="Cari nama, email, atau ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 text-white placeholder:text-zinc-500"
                        />
                    </div>
                    <ScrollArea className="h-[250px]">
                        <div className="p-1 w-full overflow-hidden">
                            {filteredUsers.length === 0 && (
                                <div className="py-6 text-center text-sm text-zinc-500">User tidak ditemukan.</div>
                            )}
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "relative w-full overflow-hidden flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-800 hover:text-white",
                                        value === user.id ? "bg-brand-yellow/10 text-brand-yellow" : "text-zinc-400"
                                    )}
                                    onClick={() => handleSelect(user.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            value === user.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="font-medium truncate max-w-full">{user.name}</div>
                                        <div className="text-[10px] text-zinc-500 truncate max-w-full">
                                            {user.email || user.id}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    )
}
