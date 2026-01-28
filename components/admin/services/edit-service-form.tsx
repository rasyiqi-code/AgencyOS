"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
import { ServiceImageUpload } from "@/components/admin/services/image-upload";
import { Button } from "@/components/ui/button";
import { FileText, ListChecks, CreditCard } from "lucide-react";

interface ServiceData {
    id: string;
    title: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
    image: string | null;
}

export function EditServiceForm({ service, featuresHtml }: { service: ServiceData, featuresHtml: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            const res = await fetch(`/api/services/${service.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to update service");

            toast.success("Service updated successfully!");
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update service");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <input type="hidden" name="id" value={service.id} />

            {/* Left Column: Primary Information */}
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">General Information</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Service Title</label>
                            <Input
                                name="title"
                                defaultValue={service.title}
                                placeholder="e.g. Enterprise Web Development"
                                required
                                className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10"
                            />
                        </div>

                        <ServiceImageUpload defaultValue={service.image} />

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</label>
                            <RichTextEditorClient
                                name="description"
                                defaultValue={service.description}
                                placeholder="Describe the value proposition..."
                                required
                                className="min-h-[120px]"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-white">Deliverables & Features</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Feature List</label>
                            <RichTextEditorClient
                                name="features"
                                defaultValue={featuresHtml}
                                placeholder="• Unlimited Revisions&#10;• Source Files Included&#10;• 3-Day Turnaround"
                                className="min-h-[150px]"
                            />
                            <p className="text-[11px] text-zinc-500">Enter features as a list. These will be displayed as a checklist.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Configuration & Actions */}
            <div className="lg:col-span-1 space-y-6">
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Pricing Model</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Price (USD)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                <Input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={service.price}
                                    placeholder="0.00"
                                    required
                                    className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 pl-7 text-lg font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Billing Interval</label>
                            <Select name="interval" defaultValue={service.interval}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one_time">One-time Payment</SelectItem>
                                    <SelectItem value="monthly">Monthly Subscription</SelectItem>
                                    <SelectItem value="yearly">Yearly Subscription</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-zinc-900/60 border-t border-white/5">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
