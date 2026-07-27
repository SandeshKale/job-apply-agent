import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // allow larger body for config uploads if needed
  },
};

export default nextConfig;
