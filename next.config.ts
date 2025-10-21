import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/data/musics/:path*',
        destination: '/api/music/serve/:path*',
      },
    ];
  },
};

export default nextConfig;
