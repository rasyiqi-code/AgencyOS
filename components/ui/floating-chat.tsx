"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MinusCircle, Loader2, Send, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
}

type ChatMode = "ai" | "human_onboarding" | "human_chat";

import { useFloatingChat } from "@/lib/store/floating-chat-store";

export function FloatingChatWidget() {
    const user = useUser();
    const { isOpen, mode, openChat, closeChat } = useFloatingChat();
    // Local state for expanded/collapsed only, visibility is global
    const [isExpanded, setIsExpanded] = useState(false);

    // Helper handlers to replace local setters
    const setMode = (newMode: ChatMode) => openChat(newMode);
    const setIsOpen = (open: boolean) => open ? openChat(mode) : closeChat();

    const [ticketId, setTicketId] = useState<string | null>(null);

    // AI Chat State
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome-1",
            role: "assistant",
            content: "Hi there! I'm CredibleSupport. How can I help you today?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [aiAvailable, setAiAvailable] = useState(true);

    // Initial check for AI status
    useEffect(() => {
        fetch("/api/system/keys/status")
            .then(res => res.json())
            .then(data => {
                setAiAvailable(data.configured);
                if (!data.configured) {
                    setMessages([
                        {
                            id: "welcome-1",
                            role: "assistant",
                            content: "Welcome! Our AI Assistant is currently offline (Not Configured). Please click 'Talk to Human' for assistance.",
                        },
                    ]);
                }
            })
            .catch(() => setAiAvailable(false));
    }, []);

    // Notification State
    const [unreadCount, setUnreadCount] = useState(0);

    const playSound = () => {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(e => console.error("Audio play failed", e));
    };

    // Human Onboarding State
    const [onboardingData, setOnboardingData] = useState({ name: "", email: "" });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, mode]);

    // Poll for new messages when in human_chat
    useEffect(() => {
        if (mode !== "human_chat" || !ticketId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/support/ticket/${ticketId}`);
                if (res.ok) {
                    const ticket = await res.json();
                    if (ticket.messages) {
                        const newMessages: Message[] = ticket.messages.map((m: { id: string, content: string, sender: string }) => ({
                            id: m.id,
                            role: m.sender === "user" ? "user" : "assistant",
                            content: m.content
                        }));
                        setMessages(prev => {
                            if (newMessages.length > prev.length) {
                                // Check if last message is from assistant/human agent
                                const lastMsg = newMessages[newMessages.length - 1];
                                if (lastMsg.role === "assistant") {
                                    playSound();
                                    if (!isOpen) setUnreadCount(c => c + 1);
                                }
                                return newMessages;
                            }
                            return prev;
                        });
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [mode, ticketId, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!aiAvailable) {
            toast.error("AI is not configured. Please contact support or check admin settings.");
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader available");

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages((prev) => [
                ...prev,
                { id: assistantMessageId, role: "assistant", content: "" },
            ]);

            let accumulatedContent = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                buffer += text;
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.message && data.message.content && data.message.content.length > 0) {
                                const chunkText = data.message.content[0].text;
                                accumulatedContent += chunkText;

                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantMessageId
                                            ? { ...m, content: accumulatedContent }
                                            : m
                                    )
                                );
                            }
                        } catch (e) {
                            console.error("Error parsing JSON chunk", e);
                        }
                    }
                }
            }
            // Finished streaming ai response
            playSound();
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHumanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !ticketId) return;

        const content = input;
        setInput("");

        // Optimistic update
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content,
        };
        setMessages((prev) => [...prev, userMessage]);

        try {
            await fetch("/api/support/ticket/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketId,
                    content,
                    sender: "user"
                })
            });
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    const startHumanHandoff = async () => {
        if (user) {
            // Already logged in, create ticket directly
            createTicket(user.primaryEmail || "", user.displayName || "");
        } else {
            // Guest, show form
            setMode("human_onboarding");
        }
    };

    const createTicket = async (email: string, name: string) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/support/ticket/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    name,
                    initialMessage: "Requesting human support."
                })
            });
            const data = await res.json();
            if (data.id) {
                setTicketId(data.id);
                setMessages(data.messages.map((m: { id: string, content: string, sender: string }) => ({
                    id: m.id,
                    role: m.sender === "user" ? "user" : "assistant",
                    content: m.content
                })));
                setMode("human_chat");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-8">
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-bounce">
                        {unreadCount}
                    </span>
                )}
                <Button
                    onClick={() => {
                        setIsOpen(true);
                        setUnreadCount(0);
                    }}
                    className="h-14 w-14 rounded-full shadow-2xl bg-brand-yellow hover:bg-brand-yellow/80 transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                    <MessageCircle className="h-7 w-7 text-black" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-300 z-50 flex flex-col overflow-hidden",
                isExpanded ? "w-[800px] h-[600px]" : "w-[380px] h-[600px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-brand-yellow/10 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-brand-yellow/30">
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback className="bg-brand-yellow text-black font-bold">
                                {mode === "human_chat" ? <User className="w-5 h-5" /> : "AI"}
                            </AvatarFallback>
                        </Avatar>
                        <span className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black", "bg-brand-yellow")}></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">
                            {mode === "human_chat" ? "Human Agent" : "Customer Support"}
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", "bg-brand-yellow")}></span>
                            {mode === "human_chat" ? "Connected" : "Online"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {mode === "ai" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-brand-yellow hover:text-black hover:bg-brand-yellow font-medium mr-2"
                            onClick={startHumanHandoff}
                        >
                            Talk to Human
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-brand-yellow hover:bg-white/5 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <MinusCircle className="h-5 w-5" /> : <div className="h-4 w-4 border-2 border-current rounded-sm" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {mode === "human_onboarding" ? (
                <div className="flex-1 p-6 flex flex-col justify-center gap-4">
                    <div className="text-center space-y-2">
                        <h4 className="text-white font-medium">Please introduce yourself</h4>
                        <p className="text-zinc-400 text-sm">We need your details to connect you with an agent.</p>
                    </div>
                    <Input
                        placeholder="Your Name"
                        className="bg-zinc-900/50 border-white/10 text-white"
                        value={onboardingData.name}
                        onChange={e => setOnboardingData({ ...onboardingData, name: e.target.value })}
                    />
                    <Input
                        placeholder="Your Email"
                        type="email"
                        className="bg-zinc-900/50 border-white/10 text-white"
                        value={onboardingData.email}
                        onChange={e => setOnboardingData({ ...onboardingData, email: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setMode("ai")}
                            className="flex-1 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createTicket(onboardingData.email, onboardingData.name)}
                            disabled={!onboardingData.email || isLoading}
                            className="flex-1 bg-brand-yellow hover:bg-brand-yellow/80 text-black font-bold"
                        >
                            {isLoading ? "Connecting..." : "Start Chat"}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex gap-3 text-sm",
                                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <Avatar className="h-8 w-8 mt-1 border border-white/10 shrink-0">
                                        <AvatarFallback
                                            className={cn(
                                                "text-xs font-bold",
                                                m.role === "user" ? "bg-zinc-800 text-zinc-300" : "bg-brand-yellow/20 text-brand-yellow"
                                            )}
                                        >
                                            {m.role === "user" ? "ME" : (mode === "human_chat" ? <User className="w-4 h-4" /> : "AI")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl max-w-[80%]",
                                            m.role === "user"
                                                ? "bg-brand-yellow text-black rounded-tr-sm font-medium"
                                                : "bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-sm"
                                        )}
                                    >
                                        <div className="prose prose-sm prose-invert max-w-none break-words">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ ...props }) => {
                                                        const isInternal = props.href?.startsWith("/");
                                                        if (isInternal) {
                                                            return <Link href={props.href!} className="text-brand-yellow underline font-bold hover:text-white transition-colors" {...props} />;
                                                        }
                                                        return <a target="_blank" rel="noopener noreferrer" className="text-brand-yellow underline font-bold hover:text-white transition-colors" {...props} />;
                                                    },
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                }}
                                            >
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 text-sm">
                                    <Avatar className="h-8 w-8 mt-1 border border-white/10 shrink-0">
                                        <AvatarFallback className="bg-brand-yellow/20 text-brand-yellow font-bold">AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl rounded-tl-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-brand-yellow" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <form onSubmit={mode === "ai" ? handleAiSubmit : handleHumanSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder={mode === "human_chat" ? "Type to human agent..." : "Type your message..."}
                                className="flex-1 bg-zinc-900/50 border-white/10 focus-visible:ring-brand-yellow/50 text-white"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className={cn("text-black cursor-pointer font-bold", "bg-brand-yellow hover:bg-brand-yellow/90")}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
