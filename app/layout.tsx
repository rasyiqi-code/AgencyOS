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
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});



export async function generateMetadata(): Promise<Metadata> {
  try {
    const locale = await getLocale();
    const settings = await getSystemSettings(["AGENCY_NAME", "SEO_TITLE", "SEO_TITLE_ID", "SEO_DESCRIPTION", "SEO_DESCRIPTION_ID", "SEO_KEYWORDS", "SEO_KEYWORDS_ID", "SEO_OG_IMAGE", "SEO_FAVICON", "SEO_GOOGLE_VERIFICATION", "SEO_GA_ID"]);
    const isId = locale === 'id';

    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    const seoTagline = (isId ? settings.find(s => s.key === "SEO_TITLE_ID")?.value : null) || settings.find(s => s.key === "SEO_TITLE")?.value || "Digital Solutions";
    const seoDesc = (isId ? settings.find(s => s.key === "SEO_DESCRIPTION_ID")?.value : null) || settings.find(s => s.key === "SEO_DESCRIPTION")?.value || "Senior Software House";
    const favicon = settings.find(s => s.key === "SEO_FAVICON")?.value;
    const seoOgImage = (isId ? settings.find(s => s.key === "SEO_OG_IMAGE_ID")?.value : null) || settings.find(s => s.key === "SEO_OG_IMAGE")?.value;
    const googleVerification = settings.find(s => s.key === "SEO_GOOGLE_VERIFICATION")?.value;

    const homepageTitle = `${agencyName} | ${seoTagline}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: homepageTitle,
        template: `%s | ${agencyName}`,
      },
      description: seoDesc,
      verification: {
        google: googleVerification,
      },
      alternates: {
        canonical: locale === 'en' ? `${baseUrl}/en` : `${baseUrl}/id`,
        languages: {
          'en': `${baseUrl}/en`,
          'id': `${baseUrl}/id`,
        },
      },
      icons: {
        icon: favicon || '/logo.png',
        shortcut: favicon || '/logo.png',
        apple: favicon || '/logo.png',
      },
      openGraph: {
        title: homepageTitle,
        description: seoDesc,
        url: baseUrl,
        siteName: agencyName,
        locale: isId ? 'id_ID' : 'en_US',
        type: 'website',
        images: seoOgImage ? [
          {
            url: seoOgImage,
            width: 1200,
            height: 630,
            alt: homepageTitle,
          }
        ] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: homepageTitle,
        description: seoDesc,
        images: seoOgImage ? [seoOgImage] : undefined,
      }
    };
  } catch (error) {
    console.error("[Metadata Debug] Error:", error);
    return {
      title: "Crediblemark",
    };
  }
}

import { MarketingPopup } from "@/components/public/marketing-popup";

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
      <head>
        {/* WebSite JSON-LD Schema for AI & Search Engine Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Crediblemark",
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Meta tags PWA */}
        <meta name="theme-color" content="#FFB800" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {midtransConfig.clientKey && (
          <link rel="preconnect" href={midtransConfig.isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com"} />
        )}
      </head>
      <body className={cn(inter.variable, inter.className, "bg-black text-white antialiased relative")}>
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
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { 'send_page_view': true });
              `}
            </Script>
          </>
        )}
        {midtransConfig.clientKey && (
          <Script
            src={snapUrl}
            data-client-key={midtransConfig.clientKey}
            strategy="lazyOnload"
          />
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
                <ServiceWorkerRegistrar />
                <InstallPrompt />
                <MarketingPopup />
              </StackTheme>
            </StackProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
