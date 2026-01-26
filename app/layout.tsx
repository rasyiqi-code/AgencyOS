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

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          defer
        ></script>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            <StackProvider app={stackServerApp}>
              <StackTheme>
                {children}
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
