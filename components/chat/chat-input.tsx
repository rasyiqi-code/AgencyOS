
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [localInput, setLocalInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;
        onSend(localInput);
        setLocalInput('');
    };

    return (
        <div className="p-3 bg-white border-t border-zinc-100">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
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
    );
}
