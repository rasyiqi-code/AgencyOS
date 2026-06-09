"use client";

import { lazy, Suspense, ComponentProps } from "react";
import type { RichTextEditor } from "./rich-text-editor";

type RichTextEditorProps = ComponentProps<typeof RichTextEditor>;

// Lazy load editor untuk mengurangi bundle size
const LazyRichTextEditor = lazy(() =>
    import("./rich-text-editor").then((mod) => ({ default: mod.RichTextEditor }))
);

export function RichTextEditorClient(props: RichTextEditorProps) {
    return (
        <Suspense fallback={<div className="h-40 animate-pulse bg-zinc-900/50 rounded-lg" />}>
            <LazyRichTextEditor {...props} />
        </Suspense>
    );
}
