"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Trash2,
    Settings2,
    LayoutTemplate,
    Globe,
    Navigation,
    Clock,
    MousePointer2,
    FormInput,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PopUp {
    id: string;
    headline: string;
    headline_id: string | null;
    description: string;
    description_id: string | null;
    ctaText: string | null;
    ctaText_id: string | null;
    ctaUrl: string | null;
    isActive: boolean;
    targetingType: string;
    targetingPaths: string[];
    targetingLocales: string[];
    showFormLead: boolean;
    formHeadline: string | null;
    formHeadline_id: string | null;
    delay: number;
    createdAt: string;
}

export function PopUpsManager() {
    const [popups, setPopups] = useState<PopUp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingPopup, setEditingPopup] = useState<Partial<PopUp> | null>(null);

    useEffect(() => {
        loadPopUps();
    }, []);

    const loadPopUps = async () => {
        try {
            const response = await fetch('/api/admin/marketing/popups');
            if (!response.ok) throw new Error("Failed to load");
            const data = await response.json();
            setPopups(data);
        } catch {
            toast.error("Gagal memuat popups");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Process targeting strings into arrays
        const payload = {
            ...data,
            delay: parseInt(data.delay as string) || 0,
            isActive: data.isActive === 'on',
            showFormLead: data.showFormLead === 'on',
            targetingPaths: (data.targetingPaths as string).split(',').map(p => p.trim()).filter(p => p),
            targetingLocales: (data.targetingLocales as string).split(',').map(l => l.trim()).filter(l => l),
        };

        try {
            const method = editingPopup?.id ? 'PATCH' : 'POST';
            const body = editingPopup?.id ? { id: editingPopup.id, ...payload } : payload;

            const response = await fetch('/api/admin/marketing/popups', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Failed to save");

            toast.success("PopUp berhasil disimpan");
            setIsOpen(false);
            setEditingPopup(null);
            loadPopUps();
        } catch {
            toast.error("Gagal menyimpan PopUp");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus PopUp ini?")) return;
        try {
            const response = await fetch(`/api/admin/marketing/popups?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete");

            toast.success("PopUp berhasil dihapus");
            loadPopUps();
        } catch {
            toast.error("Gagal menghapus PopUp");
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const response = await fetch('/api/admin/marketing/popups', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !isActive }),
            });
            if (!response.ok) throw new Error("Failed to toggle");
            loadPopUps();
        } catch {
            toast.error("Gagal mengubah status");
        }
    };

    return (
        <div className="grid gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <LayoutTemplate className="w-5 h-5 text-brand-yellow" />
                        PopUps
                    </h2>
                    <p className="text-zinc-500 text-xs font-medium">Manage promotional modals.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setEditingPopup(null)}
                            className="bg-brand-yellow text-black hover:bg-white font-black uppercase text-[10px] tracking-widest px-4 h-9 rounded-xl transition-all"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create PopUp
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/5 text-white max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                                {editingPopup ? "Edit PopUp" : "Create New PopUp"}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500">
                                Configure your promotional popup settings and targeting rules.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Headline (EN)</Label>
                                    <Input name="headline" defaultValue={editingPopup?.headline} required className="bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Headline (ID)</Label>
                                    <Input name="headline_id" defaultValue={editingPopup?.headline_id || ""} className="bg-white/5 border-white/10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (EN)</Label>
                                    <Textarea name="description" defaultValue={editingPopup?.description} required className="bg-white/5 border-white/10 min-h-[80px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (ID)</Label>
                                    <Textarea name="description_id" defaultValue={editingPopup?.description_id || ""} className="bg-white/5 border-white/10 min-h-[80px]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CTA Text (EN)</Label>
                                    <Input name="ctaText" defaultValue={editingPopup?.ctaText || ""} className="bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CTA URL</Label>
                                    <Input name="ctaUrl" defaultValue={editingPopup?.ctaUrl || ""} placeholder="https://..." className="bg-white/5 border-white/10" />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                            <FormInput className="w-3 h-3 text-brand-yellow" />
                                            Enable Lead Form
                                        </Label>
                                        <p className="text-[10px] text-zinc-500">Allow users to record their name and email directly.</p>
                                    </div>
                                    <Switch name="showFormLead" defaultChecked={editingPopup?.showFormLead} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Form Headline (EN)</Label>
                                        <Input name="formHeadline" defaultValue={editingPopup?.formHeadline || ""} placeholder="Join our waitlist" className="bg-white/5 border-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Delay (Seconds)</Label>
                                        <Input type="number" name="delay" defaultValue={editingPopup?.delay ?? 3} className="bg-white/5 border-white/10" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" />
                                    Targeting Rules
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Paths (Comma separated)</Label>
                                        <Input name="targetingPaths" defaultValue={editingPopup?.targetingPaths?.join(', ') || ""} placeholder="/portfolio, /services" className="bg-black/50 border-white/5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Locales (Comma separated)</Label>
                                        <Input name="targetingLocales" defaultValue={editingPopup?.targetingLocales?.join(', ') || ""} placeholder="id, en" className="bg-black/50 border-white/5" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Switch name="isActive" defaultChecked={editingPopup?.isActive ?? true} />
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Published</Label>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-white/5 text-zinc-400">Cancel</Button>
                                    <Button type="submit" className="bg-brand-yellow text-black font-black uppercase text-[11px] tracking-widest px-8">
                                        {editingPopup ? "Update PopUp" : "Create PopUp"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 overflow-hidden overflow-x-auto custom-scrollbar">
                <Table className="min-w-[800px]">
                    <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-xs h-12 pl-6">Popup Info</TableHead>
                            <TableHead className="text-xs h-12">Targeting</TableHead>
                            <TableHead className="text-xs h-12">Engagement</TableHead>
                            <TableHead className="text-xs h-12">Status</TableHead>
                            <TableHead className="text-right text-xs h-12 pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-zinc-500 text-sm italic">Syncing PopUps...</TableCell>
                            </TableRow>
                        ) : popups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <LayoutTemplate className="w-8 h-8 mx-auto mb-3 opacity-10" />
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-600">No PopUps Configured</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            popups.map((popup) => (
                                <TableRow key={popup.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-6 py-5">
                                        <div className="space-y-1">
                                            <div className="font-bold text-white text-sm uppercase tracking-tight">{popup.headline}</div>
                                            <div className="text-[10px] text-zinc-500 line-clamp-1 max-w-[300px] italic">&quot;{popup.description}&quot;</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <Globe className="w-3 h-3 text-zinc-600 shrink-0" />
                                                <div className="flex gap-1">
                                                    {popup.targetingLocales.length > 0 ? (
                                                        popup.targetingLocales.map(l => (
                                                            <Badge key={l} variant="outline" className="text-[8px] bg-zinc-800 border-white/5 h-4 px-1">{l}</Badge>
                                                        ))
                                                    ) : <span className="text-[9px] text-zinc-600 font-bold uppercase">All Locales</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Navigation className="w-3 h-3 text-zinc-600 shrink-0" />
                                                <div className="text-[9px] text-zinc-500 font-bold truncate max-w-[150px]">
                                                    {popup.targetingPaths.length > 0 ? popup.targetingPaths.join(', ') : 'All Paths'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                                                <Clock className="w-3 h-3 text-brand-yellow/50" />
                                                {popup.delay}s Delay
                                            </div>
                                            {popup.ctaText && (
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                                                    <MousePointer2 className="w-3 h-3 text-brand-yellow/50" />
                                                    {popup.ctaText}
                                                </div>
                                            )}
                                            {popup.showFormLead && (
                                                <Badge className="w-fit text-[8px] bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20 font-black h-4 px-1.5 uppercase tracking-tighter">Form Lead</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={popup.isActive}
                                                onCheckedChange={() => handleToggle(popup.id, popup.isActive)}
                                            />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${popup.isActive ? "text-green-500" : "text-zinc-600"}`}>
                                                {popup.isActive ? "Active" : "Paused"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-9 w-9 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl"
                                                onClick={() => {
                                                    setEditingPopup(popup);
                                                    setIsOpen(true);
                                                }}
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
                                                onClick={() => handleDelete(popup.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
