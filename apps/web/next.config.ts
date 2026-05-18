import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  transpilePackages: ["@surgexrp/ui", "@surgexrp/shared", "@surgexrp/xrpl", "@surgexrp/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // typed routes etc would go here
  },
};

export default nextConfig;
