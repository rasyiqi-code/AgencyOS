"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/support/chat-interface";
import { cn } from "@/lib/shared/utils";
import { User, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Need full ticket shape for ChatInterface
interface Message {
    id: string;
    sender: string;
    content: string;
    createdAt: Date | string;
}

interface Ticket {
    id: string;
    name: string | null;
    email: string | null;
    status: string;
    type: string;
    updatedAt: Date | string;
    createdAt: Date | string;
    messages: Message[];
}

interface ChatConsoleProps {
    tickets: Ticket[];
}

export function ChatConsole({ tickets }: ChatConsoleProps) {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
    const [search, setSearch] = useState("");
    const [showMobileSidebar, setShowMobileSidebar] = useState(true);

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    const filteredTickets = tickets.filter(t =>
    (t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.includes(search))
    );

    const handleSelectTicket = (id: string) => {
        setSelectedTicketId(id);
        setShowMobileSidebar(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] md:h-[calc(100vh-180px)] border border-white/5 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl relative">
            {/* Sidebar List */}
            <div className={cn(
                "w-full md:w-[320px] border-r border-white/5 flex flex-col bg-zinc-950 md:bg-zinc-900/40 absolute inset-0 z-20 md:relative md:translate-x-0 transition-transform duration-300",
                showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-3 border-b border-white/5 space-y-3">
                    <h3 className="font-semibold text-white text-sm">Live Chats</h3>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder="Search client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-zinc-900 border-white/10 h-8 text-xs"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 flex gap-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group",
                                selectedTicketId === ticket.id ? "bg-white/5" : ""
                            )}
                        >
                            <Avatar className="h-8 w-8 border border-white/10">
                                <AvatarFallback className="bg-zinc-800 text-zinc-300 group-hover:text-white transition-colors text-[10px]">
                                    <User className="h-3.5 w-3.5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0">
                                    <span className={cn("font-medium text-xs truncate", selectedTicketId === ticket.id ? "text-white" : "text-zinc-200")}>
                                        {ticket.name || "Unknown"}
                                    </span>
                                    <span className="text-[9px] text-zinc-600">
                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                                    {ticket.messages[0]?.content || "No messages"}
                                </p>
                            </div>
                        </button>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-6 text-center text-zinc-600 text-xs">
                            No chats found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-black relative z-10">
                {selectedTicket ? (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="md:hidden p-3 border-b border-white/5 flex items-center bg-zinc-950 h-[57px] shrink-0">
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="p-2 -ml-2 text-zinc-400 hover:text-white flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                            <div className="ml-auto flex items-center gap-2 min-w-0">
                                <span className="text-sm text-zinc-300 font-medium truncate">{selectedTicket.name || "Unknown"}</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface
                                // Force remount when ticket changes to reset state
                                key={selectedTicket.id}
                                initialTicket={selectedTicket}
                                isAdmin={true}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
