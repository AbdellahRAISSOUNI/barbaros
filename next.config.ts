import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  distDir: '.next',
  experimental: {
    // Disable features that might cause issues
    typedRoutes: false,
    // Enable modern features
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  eslint: {
    // Completely disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Completely disable TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  // Configure image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Ensure environment variables are available
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Disable powered by header
  poweredByHeader: false,
  // Configure server components
  compiler: {
    // Disable React server components trace
    reactRemoveProperties: true,
  },
  // Configure build
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Add security headers for camera permissions
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(self)',
          },
          {
            key: 'Feature-Policy',
            value: "camera 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
