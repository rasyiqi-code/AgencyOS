"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/shared/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Service } from "@prisma/client"

interface ServiceSelectorProps {
    services: Service[]
    defaultValue?: string
    translations?: {
        selectService: string;
    }
}

export function ServiceSelector({ services, defaultValue = "", translations }: ServiceSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue)
    const [searchQuery, setSearchQuery] = React.useState("")

    const handleSelect = (newValue: string) => {
        setValue(newValue)
        setOpen(false)
        setSearchQuery("")
    }

    const filteredServices = services.filter((service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative w-full">
            <input type="hidden" name="serviceId" value={value} required />
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
                                ? services.find((s) => s.id === value)?.title
                                : (translations?.selectService || "Select Service...")}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-zinc-500 group-focus-within:text-brand-yellow transition-colors" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 border-zinc-800 bg-zinc-950"
                    align="start"
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                >
                    <div className="flex items-center border-b border-zinc-800 px-3 py-1">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-zinc-500" />
                        <Input
                            placeholder="Search service..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 text-white placeholder:text-zinc-500 font-mono"
                        />
                    </div>
                    <ScrollArea className="h-[250px]">
                        <div className="p-1 w-full overflow-hidden">
                            {filteredServices.length === 0 && (
                                <div className="py-6 text-center text-sm text-zinc-500">Service not found.</div>
                            )}
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    className={cn(
                                        "relative w-full overflow-hidden flex cursor-pointer select-none py-2 items-center rounded-sm px-3 text-sm outline-none transition-colors hover:bg-zinc-800 hover:text-white",
                                        value === service.id ? "bg-brand-yellow/10 text-brand-yellow" : "text-zinc-400"
                                    )}
                                    onClick={() => handleSelect(service.id)}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="font-medium text-white truncate max-w-full">{service.title}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase mt-0.5 truncate max-w-full">
                                            {service.currency} • {service.priceType}
                                        </div>
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4 shrink-0 absolute right-3",
                                            value === service.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    )
}
