import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
