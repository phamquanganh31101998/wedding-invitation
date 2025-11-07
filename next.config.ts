import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration for the wedding invitation app
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        search: '',
      },
    ],
  },
};

export default nextConfig;
