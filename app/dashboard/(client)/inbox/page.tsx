"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, FileText, X, Loader2, MessageSquare, Plus, ChevronLeft, Search, User } from "lucide-react";
import { cn } from "@/lib/shared/utils";
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
    sender: "user" | "agent" | "admin";
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
    const [search, setSearch] = useState("");

    const { locale } = useCurrency();
    const isId = locale === 'id-ID' || locale === 'id';

    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/dashboard/tickets?type=chat");
            if (res.ok) setTickets(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const filteredTickets = tickets.filter(t =>
    (t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.includes(search))
    );

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

    const handleCreateNewChat = async () => {
        try {
            const res = await fetch("/api/support/ticket/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    initialMessage: isId ? "Chat baru dimulai" : "New chat started",
                    type: "chat"
                })
            });

            if (res.ok) {
                const newTicket = await res.json();
                setTickets(prev => [newTicket, ...prev]);
                setSelectedTicketId(newTicket.id);
            }
        } catch (e) {
            console.error("Failed to create chat", e);
        }
    };

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
            <div className={cn(
                "w-full md:w-80 border-r border-white/5 bg-zinc-900/30 flex flex-col transition-all duration-300",
                selectedTicketId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-3 border-b border-white/5 space-y-3 bg-zinc-950/20">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-semibold text-white text-sm">Live Chats</h3>
                        <Button variant="ghost" size="icon" onClick={handleCreateNewChat} className="text-zinc-500 hover:text-white hover:bg-white/5 h-7 w-7" title={isId ? "Buat Chat Baru" : "New Chat"}>
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder={isId ? "Cari pesan..." : "Search client..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-zinc-900/50 border-white/5 h-8 text-xs focus-visible:ring-1 focus-visible:ring-white/10"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-2 gap-1">
                        {tickets.length === 0 && (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                {isId ? 'Tidak ada tiket aktif.' : 'No active tickets.'}
                            </div>
                        )}
                        {filteredTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={cn(
                                    "w-full text-left px-3 py-2.5 flex gap-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group relative",
                                    selectedTicketId === ticket.id ? "bg-white/5" : ""
                                )}
                            >
                                <Avatar className="h-8 w-8 border border-white/10">
                                    <AvatarFallback className={cn(
                                        "bg-zinc-800 text-zinc-300 group-hover:text-white transition-colors text-[10px]",
                                        selectedTicketId === ticket.id ? "bg-zinc-700 text-white" : ""
                                    )}>
                                        <User className="h-3.5 w-3.5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className={cn(
                                            "font-medium text-xs truncate",
                                            selectedTicketId === ticket.id ? "text-white" : "text-zinc-200"
                                        )}>
                                            {ticket.name || ticket.email || (isId ? "Chat #" : "Chat #") + ticket.id.substring(0, 4)}
                                        </span>
                                        <span className="text-[9px] text-zinc-600">
                                            {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-[10px] truncate transition-colors",
                                        selectedTicketId === ticket.id ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-400"
                                    )}>
                                        {ticket.messages[ticket.messages.length - 1]?.content || (isId ? "Tidak ada catatan" : "No records")}
                                    </p>
                                </div>
                                {selectedTicketId === ticket.id && (
                                    <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>

            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-zinc-950/20 relative transition-all duration-300",
                !selectedTicketId ? "hidden md:flex" : "flex"
            )}>
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
                        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-white/5 flex items-center gap-3 bg-zinc-900/20 backdrop-blur-sm z-10">
                            {/* Back Button for Mobile */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-zinc-400 hover:text-white -ml-2 h-8 w-8"
                                onClick={() => setSelectedTicketId(null)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-white/10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs">
                                    CS
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-medium text-white text-sm leading-tight">
                                    {isId ? 'Layanan Pelanggan' : 'Customer Support'}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-[10px] text-emerald-400 font-medium">Online</p>
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5 uppercase tracking-wide hidden xs:inline-block">
                                {isId ? 'Chat #' : 'Chat #'} {selectedTicketId.substring(0, 6)}
                            </span>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
                            <div className="flex flex-col space-y-6">
                                {messages.map((m, idx) => {
                                    const isAgent = m.sender === "agent" || m.sender === "admin";

                                    return (
                                        <div
                                            key={m.id || idx}
                                            className={cn(
                                                "flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%]",
                                                !isAgent ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <Avatar className="h-7 w-7 md:h-8 md:w-8 mt-1 border border-white/10 shrink-0">
                                                <AvatarFallback className={cn(
                                                    "text-[10px]",
                                                    isAgent ? "bg-zinc-800 text-zinc-300" : "bg-blue-600 text-white"
                                                )}>
                                                    {isAgent ? "CS" : (isId ? "SAYA" : "ME")}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn("text-xs font-medium", !isAgent ? "text-zinc-400 text-right w-full" : "text-blue-400")}>
                                                        {isAgent ? (isId ? "Agen Dukungan" : "Support Agent") : (isId ? "Anda" : "You")}
                                                    </span>
                                                </div>

                                                <div className={cn(
                                                    "p-3 rounded-2xl text-sm leading-relaxed shadow-lg break-words",
                                                    !isAgent
                                                        ? "bg-blue-600 text-white rounded-tr-sm shadow-blue-900/20"
                                                        : "bg-zinc-800 text-white rounded-tl-sm border border-white/5"
                                                )}>
                                                    {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}

                                                    {m.attachments && m.attachments.map((att, i) => (
                                                        <a
                                                            key={i}
                                                            href={att.url}
                                                            target="_blank"
                                                            className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20 text-xs mt-2 hover:bg-black/40 transition-colors border border-white/5"
                                                        >
                                                            <div className="p-1.5 rounded bg-white/10 shrink-0">
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="opacity-90 underline underline-offset-2 truncate block max-w-[150px]">{att.name}</span>
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
                        <div className="p-3 md:p-4 border-t border-white/5 bg-zinc-900/30 backdrop-blur-md">
                            {file && (
                                <div className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/20 w-fit mb-3 max-w-full">
                                    <Paperclip className="w-3 h-3 shrink-0" />
                                    <span className="font-medium truncate block flex-1">{file.name}</span>
                                    <button onClick={() => setFile(null)} className="ml-2 hover:text-white transition-colors shrink-0">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2 relative items-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => document.getElementById('chat-file-upload')?.click()}
                                    className="text-zinc-400 hover:text-white hover:bg-white/10 h-10 w-10 shrink-0 rounded-xl"
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
                                        placeholder={isId ? 'Ketik pesan...' : 'Type message...'}
                                        className="w-full bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-blue-500/30 h-10 rounded-xl pl-3 pr-3 text-sm"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() && !file}
                                    className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                                    onClick={(e) => { if (loading) e.preventDefault(); }}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </form>
                            <div className="text-center mt-2 hidden md:block">
                                <span className="text-[10px] text-zinc-600">Press Enter to send</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
