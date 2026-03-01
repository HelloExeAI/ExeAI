import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove console logs in production to optimize performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Allows Next.js to optimize images from these external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  experimental: {
    // Other experimental performance optimizations
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  // Prevent Next.js from tracing/bundling native node libraries that throw build errors
  serverExternalPackages: ['@whiskeysockets/baileys'],
};

export default nextConfig;
