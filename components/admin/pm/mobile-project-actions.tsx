"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { ProjectSearch } from "./project-search";
import { ProjectFilter } from "./project-filter";
import { useState } from "react";

export function MobileProjectActions() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Search className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full bg-zinc-950 border-white/10 pt-16">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-left text-white">Filter Projects</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                    <ProjectSearch />
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-zinc-500">Status</label>
                        <ProjectFilter />
                    </div>
                    <Button variant="secondary" onClick={() => setOpen(false)} className="mt-2">
                        Show Results
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
