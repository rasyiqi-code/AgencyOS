"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { DeleteServiceButton } from "./delete-service-button";

interface ServiceActionButtonsProps {
    serviceId: string;
}

export function ServiceActionButtons({ serviceId }: ServiceActionButtonsProps) {
    return (
        <div 
            className="flex items-center gap-1 sm:gap-2 mr-2 relative z-20" 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Link href={`/admin/pm/services/${serviceId}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                    <Edit className="w-4 h-4" />
                </Button>
            </Link>
            <DeleteServiceButton serviceId={serviceId} />
        </div>
    );
}
