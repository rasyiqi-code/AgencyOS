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
                        className="w-full justify-between bg-black/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 px-3 font-normal overflow-hidden"
                    >
                        <span className="truncate">
                            {value
                                ? users.find((user) => user.id === value)?.name
                                : "Pilih User Akun Klien..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-zinc-800 bg-zinc-950 w-full min-w-[300px]" align="start">
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
                        <div className="p-1">
                            {filteredUsers.length === 0 && (
                                <div className="py-6 text-center text-sm text-zinc-500">User tidak ditemukan.</div>
                            )}
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-800 hover:text-white",
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
                                    <div className="flex flex-col min-w-0 pr-2">
                                        <span className="font-medium truncate">{user.name}</span>
                                        <span className="text-[10px] text-zinc-500 truncate">
                                            {user.email || user.id}
                                        </span>
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
