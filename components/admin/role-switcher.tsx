"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setAdminViewRole } from "@/app/actions/view-role";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, Layers, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface RoleSwitcherProps {
    currentRole: "admin" | "pm" | "finance";
    className?: string;
}

export function RoleSwitcher({ currentRole, className }: RoleSwitcherProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeRole, setActiveRole] = useState(currentRole);

    const rolesMap = {
        admin: {
            label: "Super Admin",
            icon: Shield,
            color: "text-red-500 border-red-500/30 bg-red-500/10"
        },
        pm: {
            label: "Project Manager",
            icon: Layers,
            color: "text-blue-500 border-blue-500/30 bg-blue-500/10"
        },
        finance: {
            label: "Finance Admin",
            icon: CreditCard,
            color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
        }
    };

    const current = rolesMap[activeRole] || rolesMap.admin;
    const Icon = current.icon;

    function handleSwitch(role: "admin" | "pm" | "finance") {
        setActiveRole(role);
        startTransition(async () => {
            await setAdminViewRole(role);
            router.refresh();
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-[22px] px-2 py-0 text-[10px] font-bold uppercase tracking-wider rounded-md border flex items-center gap-1.5 cursor-pointer hover:bg-white/5 transition-all select-none",
                        current.color,
                        className
                    )}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-zinc-400" />
                    ) : (
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                    )}
                    <span>{current.label}</span>
                    <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-zinc-950 border-white/10 text-zinc-400 w-44 z-50">
                <DropdownMenuItem
                    className={cn("text-xs font-semibold py-2 cursor-pointer flex items-center gap-2 hover:bg-white/5", activeRole === "admin" && "text-red-400 bg-red-500/5 font-bold")}
                    onClick={() => handleSwitch("admin")}
                >
                    <Shield className="h-3.5 w-3.5 text-red-500" />
                    Super Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={cn("text-xs font-semibold py-2 cursor-pointer flex items-center gap-2 hover:bg-white/5", activeRole === "pm" && "text-blue-400 bg-blue-500/5 font-bold")}
                    onClick={() => handleSwitch("pm")}
                >
                    <Layers className="h-3.5 w-3.5 text-blue-500" />
                    Project Manager
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={cn("text-xs font-semibold py-2 cursor-pointer flex items-center gap-2 hover:bg-white/5", activeRole === "finance" && "text-emerald-400 bg-emerald-500/5 font-bold")}
                    onClick={() => handleSwitch("finance")}
                >
                    <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                    Finance Admin
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
