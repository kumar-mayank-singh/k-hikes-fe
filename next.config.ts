import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  allowedDevOrigins: ["*"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://0.0.0.0:3001/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://0.0.0.0:3001/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
