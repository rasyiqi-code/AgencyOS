import Midtrans from "midtrans-client";
import { paymentGatewayService } from "./server/payment-gateway-service";
import type { MidtransPaymentMetadata } from "@/types/payment";

/**
 * Midtrans Snap API interface
 * Based on midtrans-client library methods we use
 */
interface MidtransSnap {
    createTransaction(params: {
        transaction_details: {
            order_id: string;
            gross_amount: number;
        };
        credit_card?: { secure: boolean };
        customer_details?: {
            first_name?: string;
            email?: string | null;
        };
        item_details?: Array<{
            id: string;
            price: number;
            quantity: number;
            name: string;
        }>;
    }): Promise<{ token: string; redirect_url: string }>;
}

/**
 * Midtrans Core API interface
 * Based on midtrans-client library methods we use
 */
interface MidtransCore {
    charge(params: object): Promise<MidtransPaymentMetadata>;
    transaction: {
        status(transactionId: string): Promise<{
            transaction_status: string;
            order_id: string;
            gross_amount: string;
            payment_type: string;
            signature_key?: string;
        }>;
    };
}

// Singleton instances (lazy-loaded)
let snapInstance: MidtransSnap | null = null;
let coreInstance: MidtransCore | null = null;

/**
 * Get Midtrans Snap API instance (lazy-loaded with config from database)
 */
export async function getSnap(): Promise<MidtransSnap> {
    if (!snapInstance) {
        const config = await paymentGatewayService.getMidtransConfig();

        // Midtrans library doesn't have proper TS exports, needs intermediate unknown cast
        const MidtransLib = Midtrans as unknown as { Snap: new (config: object) => MidtransSnap };
        snapInstance = new MidtransLib.Snap({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
            clientKey: config.clientKey,
        });

        console.log(`[Midtrans] Snap initialized (${config.isProduction ? 'PRODUCTION' : 'SANDBOX'} mode)`);
    }
    return snapInstance;
}

/**
 * Get Midtrans Core API instance (lazy-loaded with config from database)
 */
export async function getCore(): Promise<MidtransCore> {
    if (!coreInstance) {
        const config = await paymentGatewayService.getMidtransConfig();

        // Midtrans library doesn't have proper TS exports, needs intermediate unknown cast
        const MidtransLib = Midtrans as unknown as { CoreApi: new (config: object) => MidtransCore };
        coreInstance = new MidtransLib.CoreApi({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
            clientKey: config.clientKey,
        });

        console.log(`[Midtrans] CoreApi initialized (${config.isProduction ? 'PRODUCTION' : 'SANDBOX'} mode)`);
    }
    return coreInstance;
}

/**
 * Reset Midtrans instances (call after config changes)
 */
export function resetMidtransInstances() {
    snapInstance = null;
    coreInstance = null;
    console.log("[Midtrans] Instances reset");
}

// Legacy exports removed - use getSnap() and getCore() instead
