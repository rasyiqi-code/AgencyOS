"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, RefreshCcw, Paperclip, FileText, X, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
// import { sendMessage } from "@/app/actions/support";
import { useCurrency } from "@/components/providers/currency-provider";

interface Ticket {
    id: string;
    email: string | null;
    name: string | null;
    status: string;
    updatedAt: string;
    messages: { content: string }[];
}

interface Message {
    id: string;
    ticketId: string;
    sender: "user" | "agent";
    content: string;
    attachments?: { name: string, url: string, type: string }[];
    createdAt: string;
}

export default function InboxPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const { locale } = useCurrency();
    const isId = locale === 'id-ID' || locale === 'id';

    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/dashboard/tickets");
            if (res.ok) setTickets(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            const res = await fetch(`/api/support/ticket/${id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 5000); // Poll slower for list
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedTicketId) {
            fetchMessages(selectedTicketId);
            const interval = setInterval(async () => {
                const res = await fetch(`/api/support/ticket/${selectedTicketId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(prev => {
                        if (data.messages.length > prev.length) {
                            return data.messages;
                        }
                        return prev;
                    });
                }
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [selectedTicketId]);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !file) || !selectedTicketId) return;

        const content = input;
        const attachment = file ? { name: file.name, url: '#', type: file.type } : null;

        setInput("");
        setFile(null);
        setLoading(true);

        // Optimistic update
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: tempId,
            ticketId: selectedTicketId,
            sender: "user", // Dashboard is USER context
            content,
            attachments: attachment ? [attachment] : undefined,
            createdAt: new Date().toISOString()
        }]);

        try {
            const formData = new FormData();
            formData.append("ticketId", selectedTicketId);
            formData.append("content", content);
            formData.append("sender", "user"); // Fixing this to "user" for Client Dashboard
            if (file) formData.append("file", file);

            const res = await fetch("/api/support/ticket/message", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to send");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] rounded-2xl border border-white/5 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Sidebar List */}
            <div className="w-80 border-r border-white/5 bg-zinc-900/30 flex flex-col">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h2 className="font-semibold text-white tracking-tight">{isId ? 'Pesan' : 'Messages'}</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5">{isId ? 'Tiket Bantuan' : 'Support Tickets'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchTickets} className="text-zinc-400 hover:text-white hover:bg-white/5 h-8 w-8">
                        <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-2 gap-1">
                        {tickets.length === 0 && (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                {isId ? 'Tidak ada tiket aktif.' : 'No active tickets.'}
                            </div>
                        )}
                        {tickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={cn(
                                    "flex flex-col gap-1.5 p-3 text-left transition-all rounded-lg border border-transparent mx-1",
                                    selectedTicketId === ticket.id
                                        ? "bg-blue-500/10 border-blue-500/20 shadow-sm"
                                        : "hover:bg-white/5 hover:border-white/5"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "font-medium text-sm truncate max-w-[120px]",
                                        selectedTicketId === ticket.id ? "text-blue-100" : "text-zinc-300"
                                    )}>
                                        {ticket.name || ticket.email || (isId ? "Tiket #" : "Ticket #") + ticket.id.substring(0, 4)}
                                    </span>
                                    <span className={cn(
                                        "text-[10px]",
                                        selectedTicketId === ticket.id ? "text-blue-400" : "text-zinc-600"
                                    )}>
                                        {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs line-clamp-1",
                                    selectedTicketId === ticket.id ? "text-blue-200/60" : "text-zinc-500"
                                )}>
                                    {ticket.messages[0]?.content || (isId ? "Tidak ada catatan" : "No records")}
                                </p>
                            </button>
                        ))}
                    </div>
                </ScrollArea>

            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-zinc-950/20 relative">
                {!selectedTicketId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm">{isId ? 'Pilih percakapan untuk memulai obrolan.' : 'Select a conversation to start chatting.'}</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/20 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-white/10">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs">
                                        CS
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-white text-sm">{isId ? 'Layanan Pelanggan' : 'Customer Support'}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-[10px] text-emerald-400">Online</p>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5 uppercase tracking-wide">
                                {isId ? 'Tiket #' : 'Ticket #'} {selectedTicketId.substring(0, 6)}
                            </span>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                            <div className="space-y-6">
                                {messages.map((m, idx) => {
                                    const isAgent = m.sender === "agent";

                                    return (
                                        <div
                                            key={m.id || idx}
                                            className={cn(
                                                "flex gap-4 max-w-[85%]",
                                                !isAgent ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <Avatar className="h-8 w-8 mt-1 border border-white/10 shrink-0">
                                                <AvatarFallback className={cn(
                                                    "text-[10px]",
                                                    !isAgent ? "bg-zinc-800 text-zinc-300" : "bg-blue-600 text-white"
                                                )}>
                                                    {!isAgent ? (isId ? "SAYA" : "ME") : "CS"}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn("text-xs font-medium", !isAgent ? "text-zinc-400 text-right w-full" : "text-blue-400")}>
                                                        {!isAgent ? (isId ? "Anda" : "You") : (isId ? "Agen Dukungan" : "Support Agent")}
                                                    </span>
                                                </div>

                                                <div className={cn(
                                                    "p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg",
                                                    !isAgent
                                                        ? "bg-zinc-800 text-white rounded-tr-sm border border-white/5"
                                                        : "bg-blue-600 text-white rounded-tl-sm shadow-blue-900/20"
                                                )}>
                                                    {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}

                                                    {m.attachments && m.attachments.map((att, i) => (
                                                        <a
                                                            key={i}
                                                            href={att.url}
                                                            target="_blank"
                                                            className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20 text-xs mt-2 hover:bg-black/40 transition-colors border border-white/5"
                                                        >
                                                            <div className="p-1.5 rounded bg-white/10">
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="opacity-90 underline underline-offset-2">{att.name}</span>
                                                        </a>
                                                    ))}
                                                </div>

                                                <p className={cn("text-[10px] text-zinc-600", !isAgent ? "text-right" : "")}>
                                                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isId ? 'Baru saja' : 'Just now')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-zinc-900/30 backdrop-blur-md">
                            {file && (
                                <div className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/20 w-fit mb-3">
                                    <Paperclip className="w-3 h-3" />
                                    <span className="font-medium">{file.name}</span>
                                    <button onClick={() => setFile(null)} className="ml-2 hover:text-white transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => document.getElementById('chat-file-upload')?.click()}
                                    className="text-zinc-400 hover:text-white hover:bg-white/10 h-11 w-11 shrink-0 rounded-xl"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <input
                                    id="chat-file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
                                />
                                <div className="relative flex-1">
                                    <Input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder={isId ? 'Ketik pesan Anda...' : 'Type your message...'}
                                        className="w-full bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-blue-500/30 h-11 rounded-xl pl-4 pr-4"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() && !file}
                                    className="h-11 w-11 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                                    onClick={(e) => { if (loading) e.preventDefault(); }}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-zinc-600">Press Enter to send</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
