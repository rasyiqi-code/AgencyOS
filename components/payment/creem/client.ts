
export async function initiateCreemPayment(orderId: string): Promise<{ checkout_url: string }> {
    const res = await fetch("/api/payment/creem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to init Creem");

    if (!data.checkout_url) {
        throw new Error("No checkout URL returned");
    }

    return data;
}
