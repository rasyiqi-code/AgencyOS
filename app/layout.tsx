import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';
import "./globals.css";
import { StackTheme, StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/lib/config/stack";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalFloatingChat } from "@/components/ui/conditional-floating-chat";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { PendingCheckoutRedirect } from "@/components/store/pending-checkout-redirect";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script';
import { getSystemSettings } from "@/lib/server/settings";
import { cn } from "@/lib/shared/utils";
import { ReferralTracker } from "@/components/marketing/referral-tracker";

const inter = Inter({ subsets: ["latin"] });



export async function generateMetadata(): Promise<Metadata> {
  try {
    const locale = await getLocale();
    const settings = await getSystemSettings(["AGENCY_NAME", "SEO_TITLE", "SEO_TITLE_ID", "SEO_DESCRIPTION", "SEO_DESCRIPTION_ID", "SEO_KEYWORDS", "SEO_KEYWORDS_ID", "SEO_OG_IMAGE", "SEO_FAVICON", "SEO_GOOGLE_VERIFICATION", "SEO_GA_ID"]);
    const isId = locale === 'id';

    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    const seoTagline = (isId ? settings.find(s => s.key === "SEO_TITLE_ID")?.value : null) || settings.find(s => s.key === "SEO_TITLE")?.value || "Digital Solutions";
    const seoDesc = (isId ? settings.find(s => s.key === "SEO_DESCRIPTION_ID")?.value : null) || settings.find(s => s.key === "SEO_DESCRIPTION")?.value || "Senior Software House";
    const favicon = settings.find(s => s.key === "SEO_FAVICON")?.value;

    const homepageTitle = `${agencyName} | ${seoTagline}`;

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
      title: {
        default: homepageTitle,
        template: `%s | ${agencyName}`,
      },
      description: seoDesc,
      icons: {
        icon: favicon || '/favicon.ico',
        shortcut: favicon || '/favicon.ico',
        apple: favicon || '/apple-touch-icon.png',
      },
      openGraph: {
        title: homepageTitle,
        description: seoDesc,
        type: 'website',
      }
    };
  } catch (error) {
    console.error("[Metadata Debug] Error:", error);
    return {
      title: "Crediblemark",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const midtransConfig = await paymentGatewayService.getMidtransConfig();

  // Fetch SEO Settings for GA Script (using cache)
  const seoSettings = await getSystemSettings(["SEO_GA_ID"]);
  const gaId = seoSettings.find(s => s.key === "SEO_GA_ID")?.value;

  const snapUrl = midtransConfig.isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang={locale} className="dark">
      <body className={cn(inter.className, "bg-black text-white")}>
        <NextTopLoader
          color="#FFB800"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #FFB800,0 0 5px #FFB800"
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
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
                <ReferralTracker />
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
