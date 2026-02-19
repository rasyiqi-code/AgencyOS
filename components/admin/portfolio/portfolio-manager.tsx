"use client";

import { useState } from "react";
import { PortfolioItem, savePortfolio, deletePortfolio } from "@/lib/portfolios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Code2, AlertTriangle, Layout, Wand2, Copy, CheckCircle2, Maximize2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRef, useEffect } from "react";
import { getPortfolioHtml } from "@/lib/portfolios/actions";

// Live Preview Component for Card
function PortfolioPreview({ slug, html: directHtml }: { slug?: string; html?: string }) {
    const [fetchedContent, setFetchedContent] = useState("");

    useEffect(() => {
        if (!directHtml && slug) {
            getPortfolioHtml(slug).then(setFetchedContent);
        }
    }, [slug, directHtml]);

    const content = directHtml || fetchedContent;

    return (
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-white relative group/preview shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] ring-1 ring-zinc-100">
            <div className="absolute inset-0 origin-top-left w-[400%] h-[400%] scale-[0.25] pointer-events-none select-none">
                <iframe
                    srcDoc={content ? `<html><head><style>body { scrollbar-width: none; -ms-overflow-style: none; } body::-webkit-scrollbar { display: none; }</style></head><body>${content}</body></html>` : "<html><body style='background: #f8fafc'></body></html>"}
                    className="w-full h-full border-none overflow-hidden"
                    title="Admin Preview"
                    scrolling="no"
                />
            </div>
            <div className="absolute inset-0 bg-white/5 group-hover/preview:bg-transparent transition-colors pointer-events-none" />
        </div>
    );
}

export function PortfolioManager({ initialData }: { initialData: PortfolioItem[] }) {
    const [items, setItems] = useState(initialData);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [html, setHtml] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        if (!title || !slug || !html) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        try {
            const newItem = await savePortfolio({ title, slug, category, description: "" }, html);
            setItems([...items, newItem]);
            setIsAdding(false);
            // Reset form
            setTitle("");
            setSlug("");
            setCategory("");
            setHtml("");
            toast.success("Portfolio saved successfully");
        } catch {
            toast.error("Failed to save portfolio");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this portfolio item?")) return;

        try {
            await deletePortfolio(id);
            setItems(items.filter(i => i.id !== id));
            toast.success("Deleted successfully");
        } catch {
            toast.error("Failed to delete");
        }
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const value = e.currentTarget.value;

            // set textarea value to: text before caret + tab + text after caret
            setHtml(value.substring(0, start) + "    " + value.substring(end));

            // put caret at right position again
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                }
            }, 0);
        }
    };

    const formatHtmlContent = (raw: string) => {
        if (!raw) return "";
        try {
            let formatted = '';
            let indent = 0;
            const tab = '    ';

            // Basic HTML formatting logic
            raw.split(/>\s*</).forEach((element) => {
                if (element.match(/^\/\w/)) indent--;
                formatted += tab.repeat(indent > 0 ? indent : 0) + '<' + element + '>\n';
                if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input") && !element.startsWith("img") && !element.startsWith("br") && !element.startsWith("hr") && !element.startsWith("meta") && !element.startsWith("link")) indent++;
            });

            return formatted.substring(1, formatted.length - 2).trim();
        } catch {
            return raw;
        }
    };

    const formatHtml = () => {
        if (!html) return;
        const formatted = formatHtmlContent(html);
        if (formatted !== html) {
            setHtml(formatted);
            toast.success("Code formatted");
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText && (pastedText.includes('<') || pastedText.includes('>'))) {
            // Let the state update first, then format
            setTimeout(() => {
                setHtml(prev => formatHtmlContent(prev));
                toast.success("Auto-formatted pasted code");
            }, 50);
        }
    };

    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        if (!html) return;
        navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard");
    };

    // Syntax Highlighting Engine
    const highlightHtml = (code: string) => {
        if (!code) return "";

        let escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Comments
        escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-zinc-500 italic">$1</span>');

        // Tags
        escaped = escaped.replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="text-pink-500">$2</span>');

        // Attributes
        escaped = escaped.replace(/([a-zA-Z0-9-]+)(=)/g, '<span class="text-yellow-200/80">$1</span>$2');

        // Strings
        escaped = escaped.replace(/("[^"]*")/g, '<span class="text-green-400">$1</span>');
        escaped = escaped.replace(/('[^']*')/g, '<span class="text-green-400">$1</span>');

        // Brackets
        escaped = escaped.replace(/(&lt;)/g, '<span class="text-zinc-500">$1</span>');
        escaped = escaped.replace(/(&gt;)/g, '<span class="text-zinc-500">$1</span>');

        return escaped;
    };

    const preRef = useRef<HTMLPreElement>(null);
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (preRef.current) {
            preRef.current.scrollTop = e.currentTarget.scrollTop;
            preRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-brand-yellow border-brand-yellow/20 bg-brand-yellow/5 uppercase tracking-widest text-[9px] font-bold">
                            Content Management
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                            Portfolio Live Admin
                        </h1>
                        <div className="hidden sm:flex p-2 rounded-xl bg-white/5 border border-white/10">
                            <Layout className="w-5 h-5 text-brand-yellow" />
                        </div>
                    </div>
                    <p className="text-zinc-500 max-w-xl text-sm md:text-base leading-relaxed">
                        Manage your website showcase and <span className="text-zinc-300">local HTML designs</span>.
                    </p>
                </div>

                <div className="shrink-0">
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`font-bold transition-all duration-300 shadow-xl w-full md:w-auto ${isAdding
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                            : "bg-gradient-to-br from-brand-yellow to-yellow-600 text-black hover:scale-105 active:scale-95 shadow-brand-yellow/20"
                            }`}
                    >
                        {isAdding ? "Cancel Action" : <><Plus className="w-4 h-4 mr-2" /> Add New Project</>}
                    </Button>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

            {isAdding && (
                <div className="p-4 md:p-6 bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl space-y-3 md:space-y-4 animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 relative z-10">
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 opacity-70">Project Title</label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Banking Pro"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 hover:border-white/20 transition-all h-9 md:h-10 text-xs md:text-sm"
                            />
                        </div>
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 opacity-70">URL Slug</label>
                            <Input
                                value={slug}
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="banking-pro"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 hover:border-white/20 transition-all h-9 md:h-10 font-mono text-[10px] md:text-xs"
                            />
                        </div>
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 opacity-70">Industry</label>
                            <Input
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="e.g. Fintech"
                                className="bg-white/5 border-white/10 focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 hover:border-white/20 transition-all h-9 md:h-10 text-xs md:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2 relative z-10">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2 opacity-70">
                            <Code2 className="w-3 h-3 text-brand-yellow/70" /> Source Structure
                        </label>

                        {/* Professional IDE Editor Frame */}
                        <div
                            className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl flex flex-col group/editor transition-all hover:border-brand-yellow/30 cursor-text min-h-[300px] md:min-h-[500px]"
                            onClick={() => textareaRef.current?.focus()}
                        >
                            {/* Editor Header / Title Bar */}
                            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-white/5 sticky top-0 z-30">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 group-hover/editor:bg-red-500/60 transition-colors" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 group-hover/editor:bg-yellow-500/60 transition-colors" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 group-hover/editor:bg-green-500/60 transition-colors" />
                                    </div>
                                    <div className="h-4 w-px bg-white/5 mx-2" />
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                                        <Code2 className="w-3 h-3 text-brand-yellow/60" /> index.html
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); formatHtml(); }}
                                        className="text-[10px] font-mono text-brand-yellow hover:text-white flex items-center gap-1.5 transition-colors group/btn px-2 py-1 rounded bg-brand-yellow/5 hover:bg-brand-yellow/10"
                                    >
                                        <Wand2 className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
                                        BEAUTIFY
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-1 relative overflow-hidden h-full group/lines">
                                {/* Line Numbers Gutter */}
                                <div className="w-10 bg-black/40 border-r border-white/5 flex flex-col pt-4 select-none pointer-events-none text-right pr-2">
                                    {(html || "").split('\n').map((_, i) => (
                                        <div key={i} className="text-[10px] md:text-xs font-mono text-zinc-700 h-[1.5em] leading-[1.5em] tracking-tighter">
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>

                                {/* Editor Container */}
                                <div className="flex-1 relative overflow-hidden bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:32px_100%]">
                                    {/* Indentation Guides Overlay (Background) */}
                                    <div className="absolute inset-0 pointer-events-none opacity-20"
                                        style={{
                                            backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px)',
                                            backgroundSize: '32px 100%',
                                            backgroundPosition: '42px 0'
                                        }}
                                    />

                                    <pre
                                        ref={preRef}
                                        aria-hidden="true"
                                        className="absolute inset-0 p-4 pt-4 m-0 font-mono text-[10px] md:text-xs leading-[1.5em] pointer-events-none whitespace-pre-wrap break-words overflow-auto scrollbar-none"
                                        dangerouslySetInnerHTML={{ __html: highlightHtml(html || "") }}
                                    />

                                    <Textarea
                                        ref={textareaRef}
                                        value={html}
                                        onKeyDown={handleTabKey}
                                        onPaste={handlePaste}
                                        onScroll={handleScroll}
                                        onChange={e => setHtml(e.target.value)}
                                        placeholder="<!-- Paste your premium HTML structure here -->"
                                        className="absolute inset-0 w-full h-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 font-mono text-[10px] md:text-xs leading-[1.5em] p-4 pt-4 rounded-none resize-none scrollbar-thin scrollbar-thumb-white/5 text-transparent caret-brand-yellow whitespace-pre-wrap break-words overflow-auto z-20"
                                    />
                                </div>
                            </div>

                            {/* Editor Footer / Status Bar */}
                            <div className="bg-[#111] px-4 py-1.5 flex items-center justify-between border-t border-white/5 z-30">
                                <div className="flex items-center gap-4 text-[9px] font-mono">
                                    <span className="flex items-center gap-1 text-zinc-500">
                                        <div className="w-1 h-1 rounded-full bg-brand-yellow" /> UTF-8
                                    </span>
                                    <span className="text-zinc-500">HTML Standard</span>
                                    <span className="text-zinc-600 hidden sm:inline">LF</span>
                                    <span className="text-zinc-600">Spaces: 4</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                                        className="text-[9px] font-mono text-zinc-500 hover:text-brand-yellow flex items-center gap-1.5 transition-colors group/copy"
                                    >
                                        {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 group-hover/copy:scale-110" />}
                                        {copied ? "COPIED" : "COPY"}
                                    </button>
                                    <div className="text-[9px] font-mono text-zinc-500 tracking-tighter hidden sm:block">
                                        {(html || "").length} chars
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-1 md:pt-2 relative z-10">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-6 md:px-8 h-9 md:h-10 rounded-lg md:rounded-xl font-black shadow-lg shadow-brand-yellow/10 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-wider"
                        >
                            {isSaving ? "Publishing..." : "Live Launch"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group bg-white border border-zinc-200 rounded-3xl flex flex-col overflow-hidden hover:border-brand-yellow/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-brand-yellow/5 relative"
                    >
                        {/* Card Header - White Gold Style */}
                        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 bg-white/50 backdrop-blur-sm">
                            <h4 className="font-bold text-zinc-900 text-base tracking-tight truncate pr-4 group-hover:text-brand-yellow transition-colors">
                                {item.title}
                            </h4>
                            <div className="p-2 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-brand-yellow group-hover:bg-brand-yellow/10 transition-all border border-zinc-200 cursor-pointer">
                                <Maximize2 className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Card Body (Live Render) */}
                        <div className="p-3">
                            <PortfolioPreview slug={item.slug} />
                        </div>

                        {/* Card Footer - Silver Accents */}
                        <div className="px-5 py-3.5 flex items-center justify-between bg-zinc-50/50 border-t border-zinc-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 font-mono italic">Live Rendered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`/view-design/${item.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 text-[10px] font-black text-zinc-800 hover:text-brand-yellow transition-colors tracking-widest uppercase"
                                >
                                    PREVIEW
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                <div className="h-3 w-px bg-zinc-200" />
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Hover Overlay Glow */}
                        <div className="absolute inset-0 border-2 border-brand-yellow/0 group-hover:border-brand-yellow/10 rounded-3xl pointer-events-none transition-all duration-500" />
                    </div>
                ))}

                {items.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-zinc-900/10 border border-dashed border-white/5 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-600 text-sm">No portfolio items found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
