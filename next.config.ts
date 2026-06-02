import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // The dashboard pulls placeholder imagery from Google-hosted URLs.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
