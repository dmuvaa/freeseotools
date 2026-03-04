import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to bundle these native Node.js tools
  // They have ESM-only deep dependencies that can't be statically analysed by Turbopack
  serverExternalPackages: [
    "lighthouse",
    "chrome-launcher",
    "@paulirish/trace_engine",
    "puppeteer-core",
    "axe-core",
  ],
};

export default nextConfig;
