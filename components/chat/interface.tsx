'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ChatInterfaceProps {
    onBriefGenerated?: (brief: { title: string; description: string }) => void;
    initialContext?: string;
    estimateId?: string;
    onEstimateUpdate?: () => void;
    minimal?: boolean;
}

export function ChatInterface({ initialContext, estimateId, onEstimateUpdate, minimal = false }: ChatInterfaceProps) {
    const router = useRouter();

    // Construct initial messages based on context
    const initialMessages = initialContext
        ? [
            {
                id: 'context',
                role: 'system',
                content: `Current Project Context: ${initialContext}`
            },
            {
                id: 'welcome',
                role: 'assistant',
                content: "I've reviewed the estimate. How would you like to adjust the scope or requirements?"
            }
        ]
        : [
            {
                id: 'welcome',
                role: 'assistant',
                content: "Hello! I'm CredibleBot, your Proposal Assistant. I'm here to help you adjust the scope and price of your project.\n\nTell me what features you'd like to add or remove (e.g., 'Add a mobile app', 'Remove the admin panel'), and I'll update the quote instantly."
            }
        ];

    const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>(initialMessages);
    const [localInput, setLocalInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const userContent = localInput;
        setLocalInput('');

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userContent
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Prepare messages for API (exclude system prompt if needed, but handled by API usually)
            // Genkit endpoint expects { messages: [...] }
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            if (!response.body) throw new Error('No response body');

            // Add placeholder assistant message
            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantId,
                role: 'assistant',
                content: ''
            }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                accumulatedContent += text;

                // Update the last message (assistant)
                setMessages(prev => prev.map(m =>
                    m.id === assistantId
                        ? { ...m, content: accumulatedContent }
                        : m
                ));
            }

        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateQuote = async (action: { additions?: { screens?: { title: string, hours: number }[], apis?: { title: string, hours: number }[] }, removals?: { screens?: string[], apis?: string[] }, reason?: string }) => {
        const toastId = toast.loading("Updating estimate...");
        try {
            // Get current estimate ID from somewhere? 
            // We need to pass estimateId prop to ChatInterface or get it from URL
            // For now assuming we passed it as prop or extract from URL context
            // But better: pass it as prop.
            if (!estimateId) throw new Error("No estimate ID found");

            const response = await fetch(`/api/estimates/${estimateId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    additions: action.additions,
                    removals: action.removals
                })
            });

            if (!response.ok) throw new Error("Failed to update");

            toast.success("Estimate updated!", { id: toastId });
            router.refresh(); // Refresh server components

            // Call callback if exists
            if (onEstimateUpdate) onEstimateUpdate();

        } catch (e) {
            toast.error("Failed to update estimate", { id: toastId });
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0 border border-zinc-200 rounded-lg bg-card overflow-hidden text-sm">
            {!minimal && (
                <div className="bg-muted/30 px-3 py-2 border-b border-zinc-100 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-medium text-zinc-700">Proposal Assistant</h3>
                </div>
            )}

            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-3">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''
                                }`}
                        >
                            <Avatar className="w-6 h-6 mt-0.5 border border-zinc-100">
                                {m.role === 'user' ? (
                                    <>
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-zinc-100 text-zinc-600">
                                            <User className="w-3 h-3" />
                                        </AvatarFallback>
                                    </>
                                ) : (
                                    <>
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-blue-50 text-blue-600">
                                            <Bot className="w-3 h-3" />
                                        </AvatarFallback>
                                    </>
                                )}
                            </Avatar>

                            <div
                                className={`rounded-md px-3 py-1.5 max-w-[85%] leading-relaxed ${m.role === 'user'
                                    ? 'bg-zinc-800 text-zinc-50'
                                    : 'bg-zinc-50 border border-zinc-100 text-zinc-800'
                                    }`}
                            >
                                {m.role === 'user' ? (
                                    <div className="text-zinc-50">{m.content}</div>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                            ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                            li: ({ ...props }) => <li className="mb-0.5" {...props} />,
                                            strong: ({ ...props }) => <span className="font-semibold text-zinc-900" {...props} />,
                                            a: ({ ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                        }}
                                    >
                                        {m.content.replace(/```json[\s\S]*?```/g, '')}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-2">
                            <Avatar className="w-6 h-6 mt-0.5">
                                <AvatarFallback className="bg-transparent">
                                    <Bot className="w-3 h-3 text-zinc-400" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-xs text-zinc-400 self-center animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                    {messages.length > 1 && !isLoading && (() => {
                        const lastMessage = messages[messages.length - 1];
                        if (lastMessage.role === 'assistant') {
                            // Detect JSON Action Block
                            const jsonMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/);
                            if (jsonMatch) {
                                try {
                                    const action = JSON.parse(jsonMatch[1]);

                                    // Handle Quote Update Action
                                    if (action.type === 'update_estimate') {
                                        return (
                                            <div className="mt-4 mx-8 border rounded-md overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="bg-purple-50/50 px-3 py-2 border-b border-purple-100 flex items-center justify-between">
                                                    <div className="text-xs font-medium text-purple-700 flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 text-purple-500" />
                                                        Update Proposed
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-none"
                                                        onClick={() => handleUpdateQuote(action)}
                                                    >
                                                        Apply Changes
                                                    </Button>
                                                </div>
                                                <div className="px-3 py-2 bg-white text-xs text-zinc-600">
                                                    <p className="font-medium text-zinc-800 mb-1">{action.reason}</p>
                                                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-500">
                                                        {action.additions?.screens?.map((s: { title: string, hours: number }) => (
                                                            <li key={s.title} className="text-emerald-600">+ Screen: {s.title} ({s.hours}h)</li>
                                                        ))}
                                                        {action.additions?.apis?.map((a: { title: string, hours: number }) => (
                                                            <li key={a.title} className="text-emerald-600">+ API: {a.title} ({a.hours}h)</li>
                                                        ))}
                                                        {action.removals?.screens?.map((title: string) => (
                                                            <li key={title} className="text-red-500 line-through">- Remove Screen: {title}</li>
                                                        ))}
                                                        {action.removals?.apis?.map((title: string) => (
                                                            <li key={title} className="text-red-500 line-through">- Remove API: {title}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Handle Brief Creation Action (Existing)
                                    if (action.title && action.description) {
                                        return (
                                            <div className="mt-4 mx-8 border rounded-md overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="bg-blue-50/50 px-3 py-2 border-b border-blue-100 flex items-center justify-between">
                                                    <div className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Brief Ready
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-none"
                                                        onClick={async () => {
                                                            const toastId = toast.loading("Creating project...");
                                                            try {
                                                                const response = await fetch("/api/projects/create-from-brief", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({
                                                                        title: action.title,
                                                                        brief: action.description
                                                                    }),
                                                                });

                                                                if (!response.ok) throw new Error("Failed to create project");

                                                                const project = await response.json();
                                                                toast.success("Project created successfully", { id: toastId });
                                                                router.push(`/dashboard/projects/${project.id}`);
                                                            } catch (error) {
                                                                toast.error("Failed to create project", { id: toastId });
                                                                console.error(error);
                                                            }
                                                        }}
                                                    >
                                                        Save Project
                                                    </Button>
                                                </div>
                                                <div className="px-3 py-2 bg-white">
                                                    <p className="text-xs text-zinc-500">
                                                        I&apos;ve converted our discussion into a structured brief. Click &ldquo;Fill Form&rdquo; to proceed.
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }
                                } catch {
                                    // Invalid JSON, ignore
                                }
                            }
                        }
                        return null;
                    })()}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-3 bg-white border-t border-zinc-100">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <Input
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        placeholder="Type your requirements..."
                        className="flex-1 min-h-[36px] h-9 text-sm bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-300 focus-visible:border-zinc-300 shadow-none placeholder:text-zinc-400"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading}
                        className="h-9 w-9 bg-zinc-900 hover:bg-zinc-800 text-white shadow-none shrink-0"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
