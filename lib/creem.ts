import { createCreem } from "creem_io";

if (!process.env.CREEM_API_KEY) {
    throw new Error("CREEM_API_KEY is not defined");
}

const apiKey = process.env.CREEM_API_KEY!;
const isTestMode = apiKey.startsWith("creem_test_");

const sdk = createCreem({
    apiKey: apiKey,
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
    testMode: isTestMode,
});

// Helper for manual requests (SDK missing methods)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function manualRequest(endpoint: string, method: string, body?: any) {
    const apiKey = process.env.CREEM_API_KEY!;
    const baseUrl = apiKey.startsWith("creem_test_")
        ? "https://test-api.creem.io/v1"
        : "https://api.creem.io/v1";

    const res = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Creem Manual API Error:", JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || `Creem API Error: ${res.status}`);
    }

    if (res.status === 204) return {};
    return res.json();
}

export const creem = {
    ...sdk,
    products: {
        ...sdk.products,
        // Monkey-patch missing update method
        update: async (params: {
            productId: string;
            name?: string;
            description?: string;
            price?: number;
            billingPeriod?: string;
            imageUrl?: string;
        }) => {
            // Map camelCase to snake_case for API
            const payload = {
                name: params.name,
                description: params.description,
                price: params.price,
                billing_period: params.billingPeriod,
                image_url: params.imageUrl
            };
            // Clean undefined
            const validPayload = Object.fromEntries(
                Object.entries(payload).filter(([, v]) => v !== undefined)
            );

            return manualRequest(`/products/${params.productId}`, "PUT", validPayload);
        },
        // Monkey-patch missing delete method
        delete: async (params: { productId: string }) => {
            return manualRequest(`/products/${params.productId}`, "DELETE");
        }
    }
};
