import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { StackTheme, StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalFloatingChat } from "@/components/ui/conditional-floating-chat";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { PendingCheckoutRedirect } from "@/components/store/pending-checkout-redirect";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

import { prisma } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["AGENCY_NAME", "SEO_TITLE", "SEO_TITLE_ID", "SEO_DESCRIPTION", "SEO_DESCRIPTION_ID", "SEO_KEYWORDS", "SEO_KEYWORDS_ID", "SEO_OG_IMAGE", "SEO_FAVICON", "SEO_GOOGLE_VERIFICATION", "SEO_GA_ID"] } }
  });

  const isId = locale === 'id';

  const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

  const seoTagline = (isId ? settings.find(s => s.key === "SEO_TITLE_ID")?.value : null) || settings.find(s => s.key === "SEO_TITLE")?.value || "Digital Solutions";
  const seoDesc = (isId ? settings.find(s => s.key === "SEO_DESCRIPTION_ID")?.value : null) || settings.find(s => s.key === "SEO_DESCRIPTION")?.value || "SoloDev Async Platform";
  const seoKeywords = (isId ? settings.find(s => s.key === "SEO_KEYWORDS_ID")?.value : null) || settings.find(s => s.key === "SEO_KEYWORDS")?.value || "";

  const seoOgImage = settings.find(s => s.key === "SEO_OG_IMAGE")?.value;
  const seoFavicon = settings.find(s => s.key === "SEO_FAVICON")?.value;
  const googleVerification = settings.find(s => s.key === "SEO_GOOGLE_VERIFICATION")?.value;
  // const gaId = settings.find(s => s.key === "SEO_GA_ID")?.value;

  const homepageTitle = `${agencyName} | ${seoTagline}`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: homepageTitle,
      template: `%s | ${agencyName}`,
    },
    description: seoDesc,
    keywords: seoKeywords.split(",").map(k => k.trim()).filter(k => k),
    icons: {
      icon: seoFavicon || '/favicon.ico',
      shortcut: seoFavicon || '/favicon.ico',
      apple: seoFavicon || '/apple-touch-icon.png',
    },
    openGraph: {
      title: homepageTitle,
      description: seoDesc,
      siteName: agencyName,
      images: seoOgImage ? [{ url: seoOgImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: homepageTitle,
      description: seoDesc,
      images: seoOgImage ? [seoOgImage] : [],
    },
    verification: {
      google: googleVerification || undefined,
    },
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'id': '/id',
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const midtransConfig = await paymentGatewayService.getMidtransConfig();

  // Fetch SEO Settings for GA Script (Client Side Injection)
  const seoSettings = await prisma.systemSetting.findMany({
    where: { key: { in: ["SEO_GA_ID"] } }
  });
  const gaId = seoSettings.find(s => s.key === "SEO_GA_ID")?.value;

  const snapUrl = midtransConfig.isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang={locale}>
      <body className={inter.className}>
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
