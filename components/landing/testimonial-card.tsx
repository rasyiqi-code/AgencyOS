"use client";

import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface TestimonialCardProps {
    review: {
        name: string;
        role: string;
        text: string;
        image: string;
    };
}

export function TestimonialCard({ review }: TestimonialCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className="w-[350px] bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex-shrink-0 backdrop-blur-sm hover:border-white/20 transition-colors cursor-pointer group/card text-left"
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-white/10 ring-2 ring-white/5">
                                <AvatarImage src={review.image} className="object-cover" />
                                <AvatarFallback className="bg-zinc-800 text-white font-bold text-sm">
                                    {review.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-white font-semibold text-sm">{review.name}</div>
                                <div className="text-zinc-500 text-xs">{review.role}</div>
                            </div>
                        </div>
                        <Quote className="w-5 h-5 text-brand-yellow/40 group-hover/card:text-brand-yellow/60 transition-colors" />
                    </div>
                    <div className="relative">
                        <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3">
                            &quot;{review.text}&quot;
                        </p>
                        <span className="text-xs text-brand-yellow/80 mt-2 inline-block opacity-0 group-hover/card:opacity-100 transition-opacity">
                            Read more
                        </span>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <div className="p-6 pb-0">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border border-white/10 ring-2 ring-white/5">
                                <AvatarImage src={review.image} className="object-cover" />
                                <AvatarFallback className="bg-zinc-800 text-white font-bold text-lg">
                                    {review.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-white font-semibold text-base">{review.name}</DialogTitle>
                                <div className="text-zinc-500 text-sm">{review.role}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8">
                    <div className="relative pl-4 border-l-2 border-brand-yellow/20">
                        <Quote className="absolute -top-1 -left-2.5 w-5 h-5 text-brand-yellow/40 bg-zinc-950 p-0.5" fill="currentColor" />
                        <p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
                            {review.text}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
