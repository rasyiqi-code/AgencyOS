"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Gift, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createSubscriber } from "@/actions/marketing";

export function SubscriptionDialog({ onSubscribe }: { onSubscribe?: (email: string) => void }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createSubscriber(email, name);
            setIsSuccess(true);
            if (onSubscribe) onSubscribe(email);
            toast.success("Subscribed successfully!");
        } catch (error) {
            toast.error("Failed to subscribe. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="mt-4 p-4 bg-lime-500/10 border border-lime-500/20 rounded-lg cursor-pointer hover:bg-lime-500/20 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4 text-black" />
                        </div>
                        <div>
                            <div className="font-medium text-white group-hover:text-lime-400 transition-colors">Want a discount?</div>
                            <div className="text-xs text-zinc-400">Subscribe to get a secret coupon!</div>
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-lime-500 hover:text-lime-400">
                        Get Coupon
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
                {isSuccess ? (
                    <div className="py-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl mb-2">You're on the list!</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Use code <span className="text-brand-yellow font-mono font-bold bg-white/10 px-2 py-0.5 rounded">NEWUSER10</span> for 10% off.
                            </DialogDescription>
                        </div>
                        <Button onClick={() => setIsOpen(false)} className="bg-brand-yellow text-black hover:bg-brand-yellow/80">
                            Got it
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Unlock Your Bonus</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Join our newsletter to receive exclusive updates and a special discount code immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-zinc-400">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black/50 border-white/10 text-white"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-zinc-400">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/50 border-white/10 text-white"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-yellow/80 w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Subscribe & Reveal Code"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
