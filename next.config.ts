import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "dist",
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    webpackBuildWorker: false
  }
};

export default nextConfig;
