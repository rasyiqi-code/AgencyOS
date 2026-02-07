import { createCreem } from "creem_io";
import { paymentGatewayService } from "../server/payment-gateway-service";

/**
 * Creem SDK interface - based on the methods we actually use
 */
interface CreemProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
}

interface CreemCheckout {
    id: string;
    checkoutUrl: string;
    status: string;
}

interface CreemSDK {
    products: {
        create(params: {
            name: string;
            description?: string;
            price: number;
            currency: string;
            billingType: "onetime" | "recurring";
            billingPeriod?: "every-month" | "every-year" | "every-three-months" | "every-six-months" | "once";
            taxMode?: "inclusive" | "exclusive";
            taxCategory?: string;
            imageUrl?: string;
        }): Promise<CreemProduct>;
        get?(params: { productId: string }): Promise<CreemProduct>;
    };
    checkouts: {
        create(params: {
            productId: string;
            successUrl: string;
            metadata?: Record<string, string>;
        }): Promise<CreemCheckout>;
        get(params: { checkoutId: string }): Promise<CreemCheckout & { status: string }>;
    };
    webhooks: {
        handleEvents(
            payload: string,
            signature: string,
            callbacks: Record<string, (data: unknown) => Promise<void> | void>
        ): Promise<void>;
    };
}

/**
 * Extended Creem SDK with additional methods we monkey-patch
 */
interface ExtendedCreemSDK extends CreemSDK {
    products: CreemSDK["products"] & {
        update(params: {
            productId: string;
            name?: string;
            description?: string;
            price?: number;
            billingPeriod?: string;
            imageUrl?: string;
        }): Promise<Record<string, unknown>>;
        delete(params: { productId: string }): Promise<Record<string, unknown>>;
    };
}

// Singleton instance (lazy-loaded)
let creemInstance: CreemSDK | null = null;

/**
 * Get Creem SDK instance (lazy-loaded with config from database)
 */
export async function getCreem(): Promise<CreemSDK> {
    if (!creemInstance) {
        const config = await paymentGatewayService.getCreemConfig();

        if (!config.apiKey) {
            throw new Error("CREEM_API_KEY is not configured in database or .env");
        }

        creemInstance = createCreem({
            apiKey: config.apiKey,
            webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
            testMode: !config.isProduction,
        }) as CreemSDK;

        console.log(`[Creem] SDK initialized (${config.isProduction ? 'LIVE' : 'TEST'} mode)`);
    }
    return creemInstance;
}

/**
 * Reset Creem instance (call after config changes)
 */
export function resetCreemInstance() {
    creemInstance = null;
    console.log("[Creem] Instance reset");
}

/**
 * Helper for manual requests (SDK missing methods)
 */
async function manualRequest(endpoint: string, method: string, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const config = await paymentGatewayService.getCreemConfig();
    const baseUrl = config.isProduction
        ? "https://api.creem.io/v1"
        : "https://test-api.creem.io/v1";

    const res = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey
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

/**
 * Enhanced Creem SDK with monkey-patched methods
 */
export async function creem(): Promise<ExtendedCreemSDK> {
    const sdk = await getCreem();

    return {
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
                const payload: Record<string, unknown> = {};
                if (params.name !== undefined) payload.name = params.name;
                if (params.description !== undefined) payload.description = params.description;
                if (params.price !== undefined) payload.price = params.price;
                if (params.billingPeriod !== undefined) payload.billing_period = params.billingPeriod;
                if (params.imageUrl !== undefined) payload.image_url = params.imageUrl;

                return manualRequest(`/products/${params.productId}`, "PUT", payload);
            },
            // Monkey-patch missing delete method
            delete: async (params: { productId: string }) => {
                return manualRequest(`/products/${params.productId}`, "DELETE");
            }
        }
    };
}
