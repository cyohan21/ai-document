import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build for faster deploys
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript errors as warnings (optional - remove if you want strict checking)
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Fix for pdfjs-dist in browser environment
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
