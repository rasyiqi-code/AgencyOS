import { isAIConfigured } from "@/app/genkit/ai";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { SystemAlertsClient } from "./system-alerts-client";

export async function SystemAlerts() {
    // Memeriksa status AI dan Gateway Pembayaran secara paralel
    const [aiConfigured, gatewayConfigured] = await Promise.all([
        isAIConfigured(),
        paymentGatewayService.hasActiveGateway()
    ]);

    // Jika semua sudah dikonfigurasi dengan benar, tidak perlu menampilkan peringatan
    if (aiConfigured && gatewayConfigured) {
        return null;
    }

    return (
        <SystemAlertsClient 
            aiConfigured={aiConfigured} 
            gatewayConfigured={gatewayConfigured} 
        />
    );
}

