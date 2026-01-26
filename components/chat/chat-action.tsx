
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ChatActionProps {
    message: { role: string, content: string };
    onUpdateQuote: (action: { additions?: { screens?: { title: string, hours: number }[], apis?: { title: string, hours: number }[] }, removals?: { screens?: string[], apis?: string[] }, reason?: string }) => void;
}

export function ChatAction({ message, onUpdateQuote }: ChatActionProps) {
    if (message.role !== 'assistant') return null;

    const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) return null;

    try {
        const action = JSON.parse(jsonMatch[1]);

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
                            onClick={() => onUpdateQuote(action)}
                        >
                            Apply Changes
                        </Button>
                    </div>
                    <div className="px-3 py-2 bg-white text-xs text-zinc-600">
                        <p className="font-medium text-zinc-800 mb-1">{action.reason}</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-500">
                            {(action.additions?.screens as { title: string, hours: number }[] | undefined)?.map((s) => (
                                <li key={s.title} className="text-emerald-600">+ Screen: {s.title} ({s.hours}h)</li>
                            ))}
                            {(action.additions?.apis as { title: string, hours: number }[] | undefined)?.map((a) => (
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

        // Add other action types here (like Create Project)
        return null;

    } catch {
        return null;
    }
}
