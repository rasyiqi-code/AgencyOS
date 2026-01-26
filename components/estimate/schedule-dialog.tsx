"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Check if Dialog exists, otherwise we might need to install it or use Sheet. 
// Given the previous step installed Sheet manually, I should check if Dialog is available.
// If not, I'll use Sheet or install Dialog. 
// Actually, I'll assume I need to install dialog or use Sheet.
// Use Sheet might be easier since I know it exists, but Dialog is better UX for a form.
// Let's implement assuming Dialog components are standard Shadcn. 
// If missing, I will stick to Sheet to be safe as I already installed it.
// Wait, the plan said "Schedule Dialog". 
// Let's use Sheet since it's confirmed working and consistent with "Chat".

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface ScheduleDialogProps {
    estimate: {
        id: string;
        title: string;
        totalHours: number;
        totalCost: number;
    };
    trigger?: React.ReactNode;
}

export function ScheduleDialog({ estimate, trigger }: ScheduleDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/email/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    notes,
                    estimateId: estimate.id,
                    estimateTitle: estimate.title,
                    totalCost: estimate.totalCost,
                    totalHours: estimate.totalHours,
                    link: window.location.href
                }),
            });

            if (!response.ok) throw new Error("Failed to send request");

            toast.success("Request sent! We'll contact you shortly.");
            setOpen(false);

            // Reset form
            setName("");
            setEmail("");
            setPhone("");
            setNotes("");

        } catch (error) {
            toast.error("Failed to send request. Please try again or email us directly.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 text-base">
                        Schedule a Call for this price
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Schedule a Consultation</SheetTitle>
                    <SheetDescription>
                        Let&apos;s discuss your project <strong>{estimate.title}</strong>.
                        Fill in your details and we&apos;ll reach out to schedule a call.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Work Email</label>
                        <Input
                            type="email"
                            required
                            placeholder="john@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">WhatsApp / Phone</label>
                        <Input
                            type="tel"
                            required
                            placeholder="+62 812..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Notes (Optional)</label>
                        <Textarea
                            placeholder="Any specific questions or preferred time?"
                            className="min-h-[100px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? "Sending..." : "Submit Request"}
                        </Button>
                        <p className="text-xs text-zinc-500 mt-4 text-center">
                            We typically respond within 2 hours during business days.
                        </p>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
