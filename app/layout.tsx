import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { StackTheme, StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalFloatingChat } from "@/components/ui/conditional-floating-chat";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { PendingCheckoutRedirect } from "@/components/store/pending-checkout-redirect";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agency OS",
  description: "SoloDev Async Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const midtransConfig = await paymentGatewayService.getMidtransConfig();
  const snapUrl = midtransConfig.isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {midtransConfig.clientKey && (
          <script
            src={snapUrl}
            data-client-key={midtransConfig.clientKey}
            defer
          ></script>
        )}
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider initialLocale={locale}>
            <StackProvider app={stackServerApp}>
              <StackTheme>
                {children}
                <PendingCheckoutRedirect />
                <Suspense fallback={null}>
                  <ConditionalFloatingChat />
                </Suspense>
                <Toaster />
              </StackTheme>
            </StackProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
