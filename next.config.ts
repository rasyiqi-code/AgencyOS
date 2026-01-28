import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.crediblemark.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      }
    ],
  },
};

export default withNextIntl(nextConfig);
