"use client";

import { useEffect, ReactNode } from "react";
import { useAdminHeaderStore } from "@/lib/store/admin-header-store";

interface AdminHeaderSetterProps {
    title: ReactNode;
    actions?: ReactNode;
}

export function AdminHeaderSetter({ title, actions }: AdminHeaderSetterProps) {
    const { setTitle, setActions, clearHeader } = useAdminHeaderStore();

    useEffect(() => {
        setTitle(title);
        setActions(actions || null);
        return () => {
            clearHeader();
        };
    }, [title, actions, setTitle, setActions, clearHeader]);

    return null;
}
