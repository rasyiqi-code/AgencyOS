"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/support/chat-interface";
import { cn } from "@/lib/utils";
import { User, Search } from "lucide-react";
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

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    const filteredTickets = tickets.filter(t =>
    (t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.includes(search))
    );

    return (
        <div className="flex h-[calc(100vh-200px)] border border-white/5 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl">
            {/* Sidebar List */}
            <div className="w-[350px] border-r border-white/5 flex flex-col bg-zinc-900/40">
                <div className="p-4 border-b border-white/5 space-y-4">
                    <h3 className="font-semibold text-white">Live Chats</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-zinc-900 border-white/10"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={cn(
                                "w-full text-left px-3 py-3 flex gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group",
                                selectedTicketId === ticket.id ? "bg-white/10" : ""
                            )}
                        >
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarFallback className="bg-zinc-800 text-zinc-300 group-hover:text-white transition-colors">
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className={cn("font-medium text-sm truncate", selectedTicketId === ticket.id ? "text-white" : "text-zinc-200")}>
                                        {ticket.name || "Unknown"}
                                    </span>
                                    <span className="text-[10px] text-zinc-500">
                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 truncate group-hover:text-zinc-300 transition-colors">
                                    {ticket.messages[0]?.content || "No messages"}
                                </p>
                            </div>
                        </button>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No chats found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-black">
                {selectedTicket ? (
                    <ChatInterface
                        // Force remount when ticket changes to reset state
                        key={selectedTicket.id}
                        initialTicket={selectedTicket}
                        isAdmin={true}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
