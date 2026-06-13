import Script from "next/script";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

export async function MidtransScript() {
    // Mengambil konfigurasi Midtrans langsung dari service
    const midtransConfig = await paymentGatewayService.getMidtransConfig();
    if (!midtransConfig.clientKey || !midtransConfig.isActive) return null;

    const snapUrl = midtransConfig.isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    return (
        <>
            {/* Preconnect ke origin Midtrans untuk mempercepat resolusi DNS */}
            <link 
                rel="preconnect" 
                href={midtransConfig.isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com"} 
            />
            {/* Pemuatan script Midtrans Snap */}
            <Script
                src={snapUrl}
                data-client-key={midtransConfig.clientKey}
                strategy="lazyOnload"
            />
        </>
    );
}
