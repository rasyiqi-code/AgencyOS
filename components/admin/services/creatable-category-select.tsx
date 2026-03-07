"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface CreatableCategorySelectProps {
    categories: string[];
    defaultValue?: string;
    name?: string;
    placeholder?: string;
}

export function CreatableCategorySelect({
    categories,
    defaultValue = "",
    name = "category",
    placeholder = "Select category...",
}: CreatableCategorySelectProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defaultValue);
    const [customValue, setCustomValue] = React.useState("");
    const [isCreating, setIsCreating] = React.useState(false);

    const allCategories = React.useMemo(() => {
        const set = new Set(categories);
        if (value && !set.has(value)) set.add(value);
        return Array.from(set).sort();
    }, [categories, value]);

    return (
        <div className="space-y-2">
            <input type="hidden" name={name} value={value} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-black/20 border-white/10 text-zinc-200 hover:bg-black/30 hover:text-white h-10 px-3"
                    >
                        {value ? value : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-900 border-white/10 shadow-xl" align="start">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search category..." className="text-zinc-200" />
                        <CommandList>
                            <CommandEmpty className="p-2">
                                {!isCreating ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                                        onClick={() => setIsCreating(true)}
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        Create new category
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 p-1">
                                        <Input
                                            autoFocus
                                            placeholder="Enter name..."
                                            className="h-8 text-xs bg-black/40 border-white/10"
                                            value={customValue}
                                            onChange={(e) => setCustomValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customValue.trim()) {
                                                    setValue(customValue.trim());
                                                    setOpen(false);
                                                    setIsCreating(false);
                                                    setCustomValue("");
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            className="h-8 px-2 bg-violet-600 hover:bg-violet-500"
                                            onClick={() => {
                                                if (customValue.trim()) {
                                                    setValue(customValue.trim());
                                                    setOpen(false);
                                                    setIsCreating(false);
                                                    setCustomValue("");
                                                }
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {allCategories.map((category) => (
                                    <CommandItem
                                        key={category}
                                        value={category}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue);
                                            setOpen(false);
                                        }}
                                        className="text-zinc-300 aria-selected:bg-white/5 aria-selected:text-white cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === category ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {category}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
