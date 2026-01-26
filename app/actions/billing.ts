"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadPaymentProof(formData: FormData) {
    const file = formData.get("file") as File;
    const estimateId = formData.get("estimateId") as string;

    if (!file || !estimateId) throw new Error("Missing file or estimate ID");

    // Dynamic import to avoid module resolution issues on client if this file is shared (though it's "use server")
    const { uploadFile } = await import("@/lib/storage");

    const path = `proofs/${estimateId}-${Date.now()}-${file.name}`;
    const url = await uploadFile(file, path);

    await prisma.estimate.update({
        where: { id: estimateId },
        data: { proofUrl: url }
    });

    revalidatePath(`/checkout/${estimateId}`);
    return url;
}

export async function uploadOrderProof(formData: FormData) {
    const file = formData.get("file") as File;
    const orderId = formData.get("orderId") as string;

    if (!file || !orderId) throw new Error("Missing file or order ID");

    // Dynamic import
    const { uploadFile } = await import("@/lib/storage");

    const path = `proofs/orders/${orderId}-${Date.now()}-${file.name}`;
    const url = await uploadFile(file, path);

    await prisma.order.update({
        where: { id: orderId },
        data: {
            proofUrl: url,
            status: 'waiting_verification' // Update status to indicate manual payment sent
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
    });

    revalidatePath(`/invoices/${orderId}`);
    return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function selectPaymentMethod(orderId: string, paymentType: string, metadata: any) {
    if (!orderId) throw new Error("Missing order ID");

    await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            paymentMetadata: metadata as any
        }
    });

    revalidatePath(`/invoices/${orderId}`);
}
