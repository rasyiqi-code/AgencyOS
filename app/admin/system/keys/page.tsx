import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { AddKeyDialog } from "@/components/admin/add-key-dialog";

export default async function AdminKeysPage() {
    const keys = await prisma.systemKey.findMany({
        orderBy: { createdAt: "desc" },
    });

    async function deleteKey(id: string) {
        "use server";
        await prisma.systemKey.delete({ where: { id } });
        revalidatePath("/admin/system/keys");
    }

    async function toggleKey(id: string, current: boolean) {
        "use server";
        await prisma.systemKey.update({
            where: { id },
            data: { isActive: !current },
        });
        revalidatePath("/admin/system/keys");
    }

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">Admin Access</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Secure Vault
                        <Key className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Manage API Keys for Google Gemini and other AI providers.
                        Keys are encrypted and rotated automatically based on usage.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">




                {/* Left Column: Context/Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Keys List */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Key className="w-4 h-4 text-emerald-500" />
                                    Active Keys
                                </h3>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    {keys.filter(k => k.isActive).length} Online
                                </Badge>
                            </div>
                            <AddKeyDialog />
                        </div>

                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Label</TableHead>
                                    <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Model</TableHead>
                                    <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Fingerprint</TableHead>
                                    <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">State</TableHead>
                                    <TableHead className="text-right text-zinc-400 text-xs uppercase tracking-wider">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {keys.length === 0 && (
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Key className="w-8 h-8 opacity-20" />
                                                <p>Vault is empty. System running on fallback environment variables.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {keys.map((key) => (
                                    <TableRow key={key.id} className="hover:bg-white/5 border-white/5">
                                        <TableCell className="font-medium text-zinc-200">{key.label}</TableCell>
                                        <TableCell className="text-zinc-500 text-xs font-mono">
                                            {key.modelId ? (
                                                <span className="text-blue-400">{key.modelId}</span>
                                            ) : (
                                                <span className="opacity-50">Default Pool</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-zinc-500 text-xs">
                                            {key.key.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            <form action={toggleKey.bind(null, key.id, key.isActive)}>
                                                <button type="submit" className="hover:opacity-80 transition-opacity">
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
                                            </form>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <form action={deleteKey.bind(null, key.id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/30">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
