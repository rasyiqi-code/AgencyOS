"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InvoiceDocument } from "@/components/checkout/invoice-document";
import { ExtendedEstimate } from "@/lib/shared/types";

interface InvoiceDownloadButtonProps {
    estimate: ExtendedEstimate;
}

export function InvoiceDownloadButton({ estimate }: InvoiceDownloadButtonProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const invoiceId = estimate.id.slice(-8).toUpperCase();
    const projectTitle = estimate.project?.title || estimate.title || "Untitled";
    const dateStr = estimate.createdAt instanceof Date
        ? estimate.createdAt.toISOString().split('T')[0]
        : new Date(estimate.createdAt).toISOString().split('T')[0];

    const fileName = `Invoice-${invoiceId}-${projectTitle.replace(/[^a-z0-9]/gi, '_')}-${dateStr}`;

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: fileName,
    });

    return (
        <>
            {/* Hidden container for the print content */}
            <div style={{ display: "none" }}>
                <div ref={componentRef}>
                    <InvoiceDocument
                        estimate={estimate as ExtendedEstimate}
                        user={{ email: "Client", displayName: "Client" }}
                    />
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-white"
                onClick={() => handlePrint()}
                title="Download Invoice"
            >
                <Download className="w-4 h-4" />
            </Button>
        </>
    );
}
