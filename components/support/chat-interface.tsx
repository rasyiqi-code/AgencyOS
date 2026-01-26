"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, FileText, Loader2, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sendMessage } from "@/app/actions/support";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Message {
    id: string;
    sender: string;
    content: string;
    attachments?: { name: string; url: string; type: string }[];
    createdAt: string | Date;
}

interface Ticket {
    id: string;
    name: string | null;
    status: string;
    messages: Message[];
}

interface ChatInterfaceProps {
    initialTicket: Ticket;
    currentUserEmail?: string;
    isAdmin?: boolean;
}

export function ChatInterface({ initialTicket, isAdmin = false }: ChatInterfaceProps) {
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket>(initialTicket);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket.messages]);

    // Fast Polling for Realtime Feel (3s)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/support/ticket/${ticket.id}`);
                const data = await res.json();
                if (data && data.messages) {
                    setTicket(prev => {
                        if (data.messages.length !== prev.messages.length) return data;
                        return prev;
                    });
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [ticket.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !file) || sending) return;

        setSending(true);
        const formData = new FormData();
        formData.append("ticketId", ticket.id);
        formData.append("content", newMessage);
        formData.append("sender", isAdmin ? "admin" : "user");
        if (file) formData.append("file", file);

        try {
            await sendMessage(formData);
            setNewMessage("");
            setFile(null);

            const res = await fetch(`/api/support/ticket/${ticket.id}`);
            const data = await res.json();
            setTicket(data);

            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-zinc-900/80 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-white font-bold text-sm">{ticket.name || "Untitled Ticket"}</h2>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                        <span>•</span>
                        <span className={`capitalize ${ticket.status === 'open' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {ticket.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/20">
                {ticket.messages.length === 0 && (
                    <div className="text-center text-zinc-500 py-10 text-sm">No messages yet. Start the conversation.</div>
                )}

                {ticket.messages.map((msg) => {
                    const isAdminSender = msg.sender !== 'user';
                    return (
                        <div key={msg.id} className={`flex gap-2 ${isAdminSender ? '' : 'flex-row-reverse'}`}>
                            <Avatar className="w-7 h-7 border border-white/10 mt-1">
                                <AvatarFallback className={`text-[10px] ${isAdminSender ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {isAdminSender ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col max-w-[85%] ${isAdminSender ? 'items-start' : 'items-end'}`}>
                                <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${isAdminSender
                                        ? 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-white/5'
                                        : 'bg-indigo-600 text-white rounded-tr-none'
                                    }`}>
                                    {msg.content}
                                </div>

                                {/* Attachments */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {msg.attachments && (msg.attachments as any[]).map((att: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 flex items-center gap-2 text-[10px] p-1.5 bg-zinc-950 rounded border border-white/10 text-blue-400 hover:text-blue-300 hover:border-blue-500/30 transition-colors"
                                    >
                                        <FileText className="w-3 h-3" />
                                        {att.name}
                                    </a>
                                ))}

                                <span className="text-[9px] text-zinc-500 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-zinc-900 border-t border-white/5 shrink-0">
                {file && (
                    <div className="flex items-center gap-2 mb-2 p-1.5 bg-zinc-800 rounded text-xs text-zinc-300 border border-white/5">
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button type="button" onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 ml-auto">Remove</button>
                    </div>
                )}
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-zinc-400 hover:text-white"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <Paperclip className="w-4 h-4" />
                        </Button>
                    </div>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 h-9 bg-zinc-950 border-white/10 focus:border-white/20 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/20"
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9 bg-white text-black hover:bg-zinc-200"
                        disabled={(!newMessage.trim() && !file) || sending}
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </div>
    );
}
