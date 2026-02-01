"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface SubmitTestimonialFormProps {
    agencyName: string;
    userAvatar?: string | null;
    userName?: string | null;
}

export function SubmitTestimonialForm({ agencyName, userAvatar, userName }: SubmitTestimonialFormProps) {
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);

    async function onSubmit(formData: FormData) {
        const name = formData.get("name") as string;
        const role = formData.get("role") as string;
        const content = formData.get("content") as string;

        if (!name || !role || !content) {
            toast.error("Please fill in all fields");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/testimonials", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, role, content, avatar: userAvatar }),
                });

                const result = await res.json();

                if (result.success) {
                    setSubmitted(true);
                    toast.success("Testimonial submitted successfully!");
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } catch {
                toast.error("Failed to submit. Please try again.");
            }
        });
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold">Thank You!</h1>
                    <p className="text-zinc-400">
                        Your testimonial has been submitted successfully. It will appear on our homepage once verified by our team.
                    </p>
                    <Button
                        onClick={() => window.location.href = '/'}
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Share Your Experience</h1>
                    <p className="text-zinc-400">How has {agencyName} helped your business?</p>
                </div>

                <form action={onSubmit} className="space-y-6 bg-zinc-900/30 p-8 rounded-2xl border border-white/5">
                    {userAvatar && (
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={userAvatar}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full border-2 border-white/10 object-cover"
                                />
                                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-black">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={userName || ""}
                            placeholder="Alex Chen"
                            className="bg-black/50 border-white/10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role & Company</Label>
                        <Input
                            id="role"
                            name="role"
                            placeholder="CTO, InnovateLabs"
                            className="bg-black/50 border-white/10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Your Testimonial</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder={`${agencyName} helped us ship our MVP in record time...`}
                            className="bg-black/50 border-white/10 min-h-[120px]"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit Testimonial
                    </Button>
                </form>
            </div>
        </div>
    );
}
