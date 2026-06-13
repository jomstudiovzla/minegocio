import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Ananas",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
