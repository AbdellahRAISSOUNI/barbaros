import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  eslint: {
    // Completely disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Completely disable TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  // Additional experimental features for deployment
  experimental: {
    // Disable build-time type checking
    typedRoutes: false,
  },
};

export default nextConfig;
