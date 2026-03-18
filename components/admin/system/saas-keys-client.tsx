"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { createAgencyKey, deleteAgencyKey, toggleAgencyKey } from "@/app/actions/system-keys";
import { SystemKey } from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaaSKeysClientProps {
    initialKeys: SystemKey[];
}

export function SaaSKeysClient({ initialKeys }: SaaSKeysClientProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newLabel, setNewLabel] = useState("");

    const handleGenerate = async () => {
        if (!newLabel) return;
        
        try {
            await createAgencyKey(newLabel);
            toast.success("New SaaS Key generated!");
            setIsAddOpen(false);
            setNewLabel("");
        } catch {
            toast.error("Failed to generate key");
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await deleteAgencyKey(id);
            toast.success("Key deleted successfully");
        } catch {
            toast.error("Failed to delete key");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopy = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        toast.success("Key copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="mt-8 rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-500" />
                        AgencyOS SaaS Integration Keys
                    </h3>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                        >
                            Generate SaaS Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Generate SaaS Integration Key</DialogTitle>
                            <DialogDescription className="text-zinc-500">
                                This key will be used by your third-party SaaS to verify user subscriptions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="label" className="text-zinc-400">Label Identifier</Label>
                                <Input
                                    id="label"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="e.g. Partner SaaS PRO"
                                    className="bg-black/20 border-white/10 focus-visible:ring-blue-500/50"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-zinc-400 hover:text-white">
                                Cancel
                            </Button>
                            <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-500 text-white">
                                Generate Key
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Label</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">API Key</TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">State</TableHead>
                        <TableHead className="text-right text-zinc-400 text-xs uppercase tracking-wider">Ops</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialKeys.length === 0 && (
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableCell colSpan={4} className="text-center py-12 text-zinc-500">
                                <div className="flex flex-col items-center gap-2">
                                    <Key className="w-8 h-8 opacity-20" />
                                    <p>No SaaS integration keys found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {initialKeys.map((key) => (
                        <TableRow key={key.id} className="hover:bg-white/5 border-white/5">
                            <TableCell className="font-medium text-zinc-200">{key.label}</TableCell>
                            <TableCell className="font-mono text-zinc-500 text-xs">
                                <div className="flex items-center gap-2">
                                    <code>{key.key.substring(0, 12)}...</code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleCopy(key.id, key.key)}
                                    >
                                        {copiedId === key.id ? (
                                            <Check className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                <button 
                                    onClick={() => toggleAgencyKey(key.id, !key.isActive)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    {key.isActive ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 text-[10px]">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-[10px]">
                                            Inactive
                                        </Badge>
                                    )}
                                </button>
                            </TableCell>
                            <TableCell className="text-right">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                                            <DialogDescription className="text-zinc-500">
                                                This action cannot be undone. This will permanently delete the API key and revoke access for any SaaS integration using it.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="mt-4">
                                            <DialogClose asChild>
                                                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button 
                                                onClick={() => handleDelete(key.id)}
                                                className="bg-red-600 text-white hover:bg-red-500 border-none"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete Key"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
