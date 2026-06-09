"use client";


export const RichTextEditorClient = dynamic(
    () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
    { ssr: false }
);
