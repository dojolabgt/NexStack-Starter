import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend',
        port: '4000',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;