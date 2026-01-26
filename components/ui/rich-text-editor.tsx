"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Strikethrough } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";

function EditorToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`h-8 w-8 p-0 hover:bg-white/10 ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
            {children}
        </Button>
    );
}

interface RichTextEditorProps {
    name: string;
    defaultValue?: string;
    placeholder?: string;
    required?: boolean;
    className?: string; // Allow accepting className prop for compatibility
}

export function RichTextEditor({ name, defaultValue = "", required, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
        ],
        content: defaultValue,
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert max-w-none focus:outline-none text-zinc-200 min-h-[120px] px-3 py-2',
            },
        },
        immediatelyRender: false,
    });

    // Update hidden input when content changes
    useEffect(() => {
        if (!editor) return;

        // Initial set
        const input = document.getElementById(`input-${name}`) as HTMLInputElement;
        if (input) input.value = editor.getHTML();

        editor.on('update', ({ editor }) => {
            if (input) input.value = editor.getHTML();
        });
    }, [editor, name]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`rounded-md border border-white/10 bg-black/20 overflow-hidden focus-within:ring-1 focus-within:ring-blue-500/20 ${className || ''}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-white/5 bg-white/5 p-1">
                <EditorToggle
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </EditorToggle>
                <EditorToggle
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </EditorToggle>
                <EditorToggle
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </EditorToggle>
                <div className="mx-1 w-[1px] h-4 bg-white/10" />
                <EditorToggle
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </EditorToggle>
                <EditorToggle
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </EditorToggle>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} />

            {/* Hidden Input for Form Submission */}
            <input
                type="hidden"
                id={`input-${name}`}
                name={name}
                required={required}
            />
        </div>
    );
}
