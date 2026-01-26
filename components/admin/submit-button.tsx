"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SubmitButtonProps {
    children?: React.ReactNode;
    className?: string;
    loadingText?: string;
}

export function SubmitButton({
    children = "Save Changes",
    className,
    loadingText = "Saving..."
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className={className}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {loadingText}
                </>
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    {children}
                </>
            )}
        </Button>
    );
}
