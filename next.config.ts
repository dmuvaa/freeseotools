import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // They have ESM-only deep dependencies that can't be statically analysed by Turbopack
  serverExternalPackages: [
    "lighthouse",
    "chrome-launcher",
    "@paulirish/trace_engine",
    "puppeteer-core",
    "axe-core",
    "@sparticuz/chromium",
  ],
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
