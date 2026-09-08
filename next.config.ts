import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'nounconcept.com',
      },
      {
        protocol: 'https',
        hostname: 'www.nounconcept.com',
      },
    ],
  },
  async rewrites() {
    // If NEXT_PUBLIC_API_URL is "http://127.0.0.1:8031/api", we extract "http://127.0.0.1:8031"
    // Use an environment variable or default to the backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8031';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*/`,
      },
      {
        source: '/media/:path*',
        destination: `${backendUrl}/media/:path*`,
      },
    ]
  },
};

export default nextConfig;
