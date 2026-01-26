"use client";

import dynamic from "next/dynamic";

export const RichTextEditorClient = dynamic(
    () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
    { ssr: false }
);
