import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let apiHostname = 'localhost';
let apiPort = '4000';
let apiProtocol: 'http' | 'https' = 'http';

try {
  const parsed = new URL(apiUrl);
  apiHostname = parsed.hostname;
  apiPort = parsed.port;
  apiProtocol = parsed.protocol.replace(':', '') as 'http' | 'https';
} catch (error) {
  console.warn('Failed to parse NEXT_PUBLIC_API_URL, using defaults');
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        ...(apiPort && { port: apiPort }),
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
