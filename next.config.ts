import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 300,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.crediblemark.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.midtrans.com https://*.sandbox.midtrans.com https://snap-popup-app.midtrans.com https://snap-popup-app.sandbox.midtrans.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://unpkg.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.midtrans.com https://cdn.tailwindcss.com;
              img-src 'self' blob: data: https://media.crediblemark.com https://*.r2.dev https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://i.pravatar.cc https://*.midtrans.com;
              font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;
              connect-src 'self' https://*.midtrans.com https://*.sandbox.midtrans.com https://snap-popup-app.midtrans.com https://snap-popup-app.sandbox.midtrans.com https://*.google-analytics.com https://api.stack-auth.com https://app.stack-auth.com https://1.1.1.1 https://static.cloudflareinsights.com https://cloudflare.com https://*.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net;
              frame-src 'self' * https://*.midtrans.com https://*.sandbox.midtrans.com https://snap-popup-app.midtrans.com https://snap-popup-app.sandbox.midtrans.com;
              worker-src 'self' blob:;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
      // CSP permisif untuk halaman dan API preview portfolio — agar konten bisa memuat berbagai CDN
      // Dimasukkan di bawah agar meng-overwrite default CSP di atas
      // Mendukung path dengan atau tanpa locale (id/en)
      {
        source: '/:path*(portfolio|view-design)/:slug*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              img-src * data: blob:;
              media-src * data: blob:;
              font-src * data:;
              frame-src *;
              connect-src *;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
      // Alias khusus untuk API route agar tetap kena permissive CSP
      {
        source: '/api/view-design/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              img-src * data: blob:;
              media-src * data: blob:;
              font-src * data:;
              frame-src *;
              connect-src *;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
      // Header khusus untuk Service Worker — tanpa cache agar selalu fresh
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(withNextIntl(nextConfig));
