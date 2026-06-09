import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { DeleteServiceButton } from "./delete-button";

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
            <a href={`/admin/pm/services/${serviceId}/edit`}>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                </Button>
            </a>
            <DeleteServiceButton serviceId={serviceId} />
        </div>
    );
}
