import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.crediblemark.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
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
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com https://snap.midtrans.com https://www.googletagmanager.com https://static.cloudflareinsights.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https://media.crediblemark.com https://*.r2.dev https://avatars.githubusercontent.com https://lh3.googleusercontent.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.google-analytics.com https://api.stack-auth.com https://app.stack-auth.com https://1.1.1.1 https://static.cloudflareinsights.com;
              frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://snap.midtrans.com;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
