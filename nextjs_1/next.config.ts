import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/events',
        destination: '/',
      },
      {
        source: '/login',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
