"use client";

import { useState, useEffect } from "react";
import { getBonuses, createBonus, deleteBonus, toggleBonusStatus } from "@/actions/marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Gift, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface Bonus {
    id: string;
    title: string;
    description: string | null;
    value: string | null;
    icon: string | null;
    isActive: boolean;
    createdAt: Date;
}

export function BonusesManager() {
    const [bonuses, setBonuses] = useState<Bonus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBonus, setNewBonus] = useState({
        title: "",
        description: "",
        value: "",
        icon: "CheckCircle2",
    });

    useEffect(() => {
        loadBonuses();
    }, []);

    const loadBonuses = async () => {
        try {
            const data = await getBonuses();
            setBonuses(data);
        } catch (error) {
            toast.error("Failed to load bonuses");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newBonus.title) {
            toast.error("Title is required");
            return;
        }

        try {
            await createBonus({
                title: newBonus.title,
                description: newBonus.description || undefined,
                value: newBonus.value || undefined,
                icon: newBonus.icon || undefined,
            });
            toast.success("Bonus created successfully");
            setNewBonus({ title: "", description: "", value: "", icon: "CheckCircle2" });
            loadBonuses();
        } catch (error) {
            toast.error("Failed to create bonus");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this bonus?")) return;
        try {
            await deleteBonus(id);
            toast.success("Bonus deleted");
            loadBonuses();
        } catch (error) {
            toast.error("Failed to delete bonus");
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleBonusStatus(id, !currentStatus);
            loadBonuses();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="grid gap-6">
            {/* Create Form */}
            <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/40 space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand-yellow" />
                    Add New Bonus
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <Input
                            placeholder="Title (e.g. 1 Year Server Maintenance)"
                            value={newBonus.title}
                            onChange={(e) => setNewBonus({ ...newBonus, title: e.target.value })}
                        />
                    </div>
                    <Input
                        placeholder="Value (e.g. Worth $500)"
                        value={newBonus.value}
                        onChange={(e) => setNewBonus({ ...newBonus, value: e.target.value })}
                    />
                    <Input
                        placeholder="Icon Name (Lucide)"
                        value={newBonus.icon}
                        onChange={(e) => setNewBonus({ ...newBonus, icon: e.target.value })}
                    />
                    <Button onClick={handleCreate} className="bg-brand-yellow text-black hover:bg-brand-yellow/80">
                        Add Bonus
                    </Button>
                </div>
                <Input
                    placeholder="Description (Optional)"
                    value={newBonus.description}
                    onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                />
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead>Active</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Loading...</TableCell>
                            </TableRow>
                        ) : bonuses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">No bonuses found.</TableCell>
                            </TableRow>
                        ) : (
                            bonuses.map((bonus) => {
                                // Dynamic Icon Loading
                                // @ts-ignore
                                const IconComponent = LucideIcons[bonus.icon] || Gift;

                                return (
                                    <TableRow key={bonus.id} className="border-white/5">
                                        <TableCell>
                                            <Switch
                                                checked={bonus.isActive}
                                                onCheckedChange={() => handleToggle(bonus.id, bonus.isActive)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{bonus.title}</span>
                                                {bonus.description && <span className="text-xs text-zinc-500">{bonus.description}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-brand-yellow text-sm font-medium">
                                            {bonus.value || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                                onClick={() => handleDelete(bonus.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
