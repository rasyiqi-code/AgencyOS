
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === 'user';

    // Hide system messages or handle them differently
    if (message.role === 'system') return null;

    return (
        <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            <Avatar className="w-6 h-6 mt-0.5 border border-zinc-100">
                {isUser ? (
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
                className={`rounded-md px-3 py-1.5 max-w-[85%] leading-relaxed text-sm ${isUser
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'bg-zinc-50 border border-zinc-100 text-zinc-800'
                    }`}
            >
                {isUser ? (
                    <div className="text-zinc-50">{message.content}</div>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node: _node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ node: _node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                            ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                            li: ({ node: _node, ...props }) => <li className="mb-0.5" {...props} />,
                            strong: ({ node: _node, ...props }) => <span className="font-semibold text-zinc-900" {...props} />,
                            a: ({ node: _node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        }}
                    >
                        {/* Remove JSON blocks from display text */}
                        {message.content.replace(/```json[\s\S]*?```/g, '')}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}
