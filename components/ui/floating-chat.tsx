"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MinusCircle, Loader2, Send, X, User } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
}

type ChatMode = "ai" | "human_onboarding" | "human_chat";

import { useFloatingChat } from "@/lib/store/floating-chat-store";

export function FloatingChatWidget() {
    const user = useUser();
    const t = useTranslations("FloatingChat");
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
            const formData = new FormData();
            formData.append("ticketId", ticketId);
            formData.append("content", content);
            formData.append("sender", "user");

            await fetch("/api/support/ticket/message", {
                method: "POST",
                body: formData
            });
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    const startHumanHandoff = async () => {
        console.log("Starting human handoff, user state:", user ? "logged in" : "guest");
        if (user) {
            // Already logged in, initiate chat directly
            try {
                await initiateLiveChat(user.primaryEmail || "", user.displayName || "");
            } catch (err) {
                console.error("Handoff failed", err);
                toast.error("Failed to start live chat. Please check if server is ready.");
            }
        } else {
            // Guest, show form
            console.log("Switching to human_onboarding mode");
            setMode("human_onboarding");
        }
    };

    const initiateLiveChat = async (email: string, name: string) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/support/ticket/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    name,
                    initialMessage: "User started a live chat session.",
                    type: "chat"
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create ticket");
            }

            const data = await res.json();
            if (data.id) {
                setTicketId(data.id);
                setMessages(data.messages.map((m: { id: string, content: string, sender: string }) => ({
                    id: m.id,
                    role: m.sender === "user" ? "user" : "assistant",
                    content: m.content
                })));
                setMode("human_chat");
                toast.success("Connected to human support");
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Failed to connect to support";
            console.error("Create Ticket Error:", e);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 group transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-8">
                {/* Options Container - Reveals on hover */}
                <div className="flex flex-col items-end gap-3 mb-2 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">

                    {/* Telegram */}
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity delay-150 whitespace-nowrap">
                            Telegram
                        </span>
                        <Button
                            onClick={() => window.open("https://t.me/crediblemark", "_blank")}
                            className="h-12 w-12 rounded-full shadow-xl bg-[#0088cc] hover:bg-[#0077b5] text-white transition-all duration-300 hover:scale-110"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                        </Button>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity delay-100 whitespace-nowrap">
                            WhatsApp
                        </span>
                        <Button
                            onClick={() => window.open("https://wa.me/6285183131249", "_blank")}
                            className="h-12 w-12 rounded-full shadow-xl bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all duration-300 hover:scale-110"
                        >
                            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </Button>
                    </div>

                    {/* Live Chat */}
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity delay-75 whitespace-nowrap">
                            Live Chat
                        </span>
                        <Button
                            onClick={() => {
                                setIsOpen(true);
                                setUnreadCount(0);
                            }}
                            className="h-12 w-12 rounded-full shadow-xl bg-brand-yellow hover:bg-brand-yellow/80 text-black transition-all duration-300 hover:scale-110"
                        >
                            <MessageCircle className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Main Trigger Pill */}
                <div className="relative shadow-2xl rounded-full transition-transform duration-300 group-hover:scale-105 cursor-pointer bg-white border border-zinc-100">
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-bounce border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                    <div className="px-6 py-3 font-bold text-sm flex items-center gap-2 text-black">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        {t("needHelp")}
                    </div>
                </div>
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
                            onClick={() => initiateLiveChat(onboardingData.email, onboardingData.name)}
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
                                        <div className={cn(
                                            "prose prose-sm max-w-none break-words",
                                            m.role === "user" ? "prose-black" : "prose-invert"
                                        )}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ ...props }) => {
                                                        const isInternal = props.href?.startsWith("/");
                                                        if (isInternal) {
                                                            return <Link href={props.href!} className={cn("underline font-bold transition-colors", m.role === "user" ? "text-black hover:text-zinc-700" : "text-brand-yellow hover:text-white")} {...props} />;
                                                        }
                                                        return <a target="_blank" rel="noopener noreferrer" className={cn("underline font-bold transition-colors", m.role === "user" ? "text-black hover:text-zinc-700" : "text-brand-yellow hover:text-white")} {...props} />;
                                                    },
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                                    strong: ({ children }) => <strong className={cn("font-bold", m.role === "user" ? "text-black" : "text-white")}>{children}</strong>,
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
